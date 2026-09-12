import { randomUUID } from "node:crypto";
import express from "express";
import { publicAppOrigin } from "../db.js";
import { getEntitlement } from "../middleware/auth.js";
import {
  createCustomerPortalSession,
  billingInfo,
  findBusinessByStripeCustomer,
  findBusinessByStripeSubscription,
  getStripe,
  hasStripeWebhookSecret,
  isStripeConfigured,
  resolveStripePriceId,
  upsertSubscriptionFromStripe,
} from "../services/stripe.js";

export function billingRoutes(db) {
  const router = express.Router();

  router.get("/status", async (req, res) => {
    const subscription = await db.getSubscriptionByBusinessId(req.business.id);
    res.json({ entitlement: getEntitlement(subscription), ...billingInfo() });
  });

  router.post("/checkout", async (req, res) => {
    const origin = publicAppOrigin();
    const successUrl = isStripeConfigured()
      ? `${origin}/app/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/app/billing?checkout=success`;

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({
          error: "Payments are not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID or STRIPE_PRODUCT_ID.",
        });
      }

      await db.updateSubscription(req.business.id, {
        stripe_subscription_id: `local_${randomUUID()}`,
        status: "active",
      });

      return res.json({ url: successUrl, provider: "local" });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        error: "Payments are not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID or STRIPE_PRODUCT_ID.",
      });
    }
    const subscription = await db.getSubscriptionByBusinessId(req.business.id);

    try {
      const priceId = await resolveStripePriceId(stripe);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: `${origin}/app/billing?checkout=cancelled`,
        customer: subscription?.stripe_customer_id || undefined,
        customer_email: subscription?.stripe_customer_id ? undefined : req.user.email,
        client_reference_id: req.business.id,
        metadata: { businessId: req.business.id },
        subscription_data: {
          metadata: { businessId: req.business.id },
        },
      });
      res.json({ url: session.url, provider: "stripe" });
    } catch (error) {
      console.error("[stripe:checkout]", error);
      res.status(500).json({
        error:
          process.env.NODE_ENV === "production"
            ? "Could not start checkout."
            : error.message || "Could not start checkout.",
      });
    }
  });

  router.post("/complete", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured." });
    }

    const sessionId = String(req.body?.sessionId || "");
    if (!sessionId.startsWith("cs_")) {
      return res.status(400).json({ error: "Missing checkout session." });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription"],
      });
      const businessId = session.metadata?.businessId || session.client_reference_id;
      if (businessId !== req.business.id) {
        return res.status(403).json({ error: "This checkout does not belong to your account." });
      }
      if (session.status !== "complete" && session.payment_status === "unpaid") {
        return res.status(400).json({ error: "Checkout is not complete yet." });
      }

      const subscriptionObject = session.subscription;
      const subscription =
        typeof subscriptionObject === "string"
          ? await stripe.subscriptions.retrieve(subscriptionObject)
          : subscriptionObject;
      if (subscription) {
        await upsertSubscriptionFromStripe(db, {
          businessId: req.business.id,
          customerId: session.customer,
          subscription,
        });
      }

      const next = await db.getSubscriptionByBusinessId(req.business.id);
      res.json({ entitlement: getEntitlement(next), ...billingInfo() });
    } catch (error) {
      console.error("[stripe:complete]", error);
      res.status(500).json({ error: "Could not confirm the subscription." });
    }
  });

  router.post("/cancel", async (req, res) => {
    const subscription = await db.getSubscriptionByBusinessId(req.business.id);

    if (!subscription) {
      return res.status(404).json({ error: "No subscription found." });
    }

    const isLocal = String(subscription.stripe_subscription_id || "").startsWith("local_");
    if (isStripeConfigured() && subscription.stripe_customer_id && !isLocal) {
      return res.status(400).json({ error: "Use Manage subscription to cancel a Stripe plan." });
    }

    await db.updateSubscription(req.business.id, {
      status: "canceled",
      stripe_subscription_id: null,
    });

    const next = await db.getSubscriptionByBusinessId(req.business.id);
    res.json({ entitlement: getEntitlement(next) });
  });

  router.post("/portal", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    const subscription = await db.getSubscriptionByBusinessId(req.business.id);
    if (!subscription?.stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer yet. Subscribe first." });
    }

    try {
      const origin = publicAppOrigin();
      const portal = await createCustomerPortalSession(stripe, subscription.stripe_customer_id, `${origin}/app/billing`);
      res.json({ url: portal.url });
    } catch (error) {
      console.error("[stripe:portal]", error);
      res.status(500).json({ error: "Could not open the billing portal." });
    }
  });

  return router;
}

export function stripeWebhookHandler(db) {
  return async (req, res) => {
    const stripe = getStripe();
    if (!stripe) return res.status(500).send("Stripe is not configured.");
    if (!hasStripeWebhookSecret()) {
      return res.status(500).send("STRIPE_WEBHOOK_SECRET is not set.");
    }

    const signature = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const businessId = session.metadata?.businessId || session.client_reference_id;
        if (businessId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscriptionFromStripe(db, {
            businessId,
            customerId: session.customer,
            subscription,
          });
        }
      }

      if (
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted" ||
        event.type === "customer.subscription.created"
      ) {
        const subscription = event.data.object;
        const bySub = await findBusinessByStripeSubscription(db, subscription.id);
        const byCustomer = await findBusinessByStripeCustomer(db, subscription.customer);
        const row = bySub || byCustomer;
        const businessId = subscription.metadata?.businessId || row?.business_id;
        if (businessId) {
          await upsertSubscriptionFromStripe(db, {
            businessId,
            customerId: subscription.customer,
            subscription,
          });
        }
      }

      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;
        const row = await findBusinessByStripeCustomer(db, invoice.customer);
        if (row) {
          await db.updateSubscription(row.business_id, { status: "past_due" });
        }
      }
    } catch (error) {
      console.error("[stripe:webhook]", error);
      return res.status(500).send("Webhook handler failed.");
    }

    res.json({ received: true });
  };
}
