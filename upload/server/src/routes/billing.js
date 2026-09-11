import { randomUUID } from "node:crypto";
import express from "express";
import { getEntitlement } from "../middleware/auth.js";
import {
  billingInfo,
  findBusinessByStripeCustomer,
  findBusinessByStripeSubscription,
  getStripe,
  isStripeConfigured,
  upsertSubscriptionFromStripe,
} from "../services/stripe.js";

export function billingRoutes(db) {
  const router = express.Router();

  router.get("/status", (req, res) => {
    const subscription = db
      .prepare("SELECT * FROM subscriptions WHERE business_id = ?")
      .get(req.business.id);
    res.json({ entitlement: getEntitlement(subscription), ...billingInfo() });
  });

  router.post("/checkout", async (req, res) => {
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
    const successUrl = `${origin}/app/billing?checkout=success`;

    if (!isStripeConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({
          error: "Payments are not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID.",
        });
      }

      db.prepare(
        `UPDATE subscriptions
         SET stripe_subscription_id = ?, status = 'active'
         WHERE business_id = ?`
      ).run(`local_${randomUUID()}`, req.business.id);

      return res.json({ url: successUrl, provider: "local" });
    }

    const stripe = getStripe();
    const subscription = db
      .prepare("SELECT * FROM subscriptions WHERE business_id = ?")
      .get(req.business.id);

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
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

  router.post("/cancel", (req, res) => {
    const subscription = db
      .prepare("SELECT * FROM subscriptions WHERE business_id = ?")
      .get(req.business.id);

    if (!subscription) {
      return res.status(404).json({ error: "No subscription found." });
    }

    const isLocal = String(subscription.stripe_subscription_id || "").startsWith("local_");
    if (isStripeConfigured() && subscription.stripe_customer_id && !isLocal) {
      return res.status(400).json({ error: "Use Manage subscription to cancel a Stripe plan." });
    }

    db.prepare(
      `UPDATE subscriptions
       SET status = 'canceled', stripe_subscription_id = NULL
       WHERE business_id = ?`
    ).run(req.business.id);

    const next = db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(req.business.id);
    res.json({ entitlement: getEntitlement(next) });
  });

  router.post("/portal", async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    const subscription = db
      .prepare("SELECT * FROM subscriptions WHERE business_id = ?")
      .get(req.business.id);
    if (!subscription?.stripe_customer_id) {
      return res.status(400).json({ error: "No Stripe customer yet. Subscribe first." });
    }

    try {
      const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
      const portal = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${origin}/app/billing`,
      });
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
          upsertSubscriptionFromStripe(db, {
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
        const bySub = findBusinessByStripeSubscription(db, subscription.id);
        const byCustomer = findBusinessByStripeCustomer(db, subscription.customer);
        const row = bySub || byCustomer;
        const businessId = subscription.metadata?.businessId || row?.business_id;
        if (businessId) {
          upsertSubscriptionFromStripe(db, {
            businessId,
            customerId: subscription.customer,
            subscription,
          });
        }
      }

      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object;
        const row = findBusinessByStripeCustomer(db, invoice.customer);
        if (row) {
          db.prepare("UPDATE subscriptions SET status = ? WHERE business_id = ?").run(
            "past_due",
            row.business_id
          );
        }
      }
    } catch (error) {
      console.error("[stripe:webhook]", error);
      return res.status(500).send("Webhook handler failed.");
    }

    res.json({ received: true });
  };
}
