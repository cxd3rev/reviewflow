import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { nowIso } from "../db.js";

function envValue(name) {
  return String(process.env[name] || "").trim();
}

export function hasStripeSecret() {
  const key = envValue("STRIPE_SECRET_KEY");
  return /^sk_(test|live)_/.test(key) && !/your_key/i.test(key) && key.length > 24;
}

export function configuredPriceId() {
  const price = envValue("STRIPE_PRICE_ID");
  if (/^price_/.test(price) && !/your_price/i.test(price) && price.length > 10) return price;
  return "";
}

export function configuredProductId() {
  const product = envValue("STRIPE_PRODUCT_ID");
  if (/^prod_/.test(product) && !/your_product/i.test(product) && product.length > 8) return product;
  return "";
}

export function hasStripeWebhookSecret() {
  const secret = envValue("STRIPE_WEBHOOK_SECRET");
  return secret.startsWith("whsec_") && !/your_webhook/i.test(secret) && secret.length > 16;
}

export function isStripeConfigured() {
  return hasStripeSecret() && Boolean(configuredPriceId() || configuredProductId());
}

/** @returns {any} */
export function getStripe() {
  if (!hasStripeSecret()) return null;
  return new Stripe(envValue("STRIPE_SECRET_KEY"));
}

export function billingInfo() {
  return {
    stripeConfigured: isStripeConfigured(),
    provider: isStripeConfigured() ? "stripe" : "local",
    webhookConfigured: hasStripeWebhookSecret(),
  };
}

let portalConfigurationId = null;

export async function createCustomerPortalSession(stripe, customerId, returnUrl) {
  const params = { customer: customerId, return_url: returnUrl };
  try {
    if (!portalConfigurationId) {
      const existing = await stripe.billingPortal.configurations.list({ limit: 1, active: true });
      if (existing.data[0]?.id) {
        portalConfigurationId = existing.data[0].id;
      } else {
        const created = await stripe.billingPortal.configurations.create({
          business_profile: { headline: "starywrld" },
          features: {
            invoice_history: { enabled: true },
            payment_method_update: { enabled: true },
            subscription_cancel: { enabled: true, mode: "at_period_end" },
          },
        });
        portalConfigurationId = created.id;
      }
    }
    if (portalConfigurationId) params.configuration = portalConfigurationId;
  } catch (error) {
    console.error("[stripe:portal-config]", error.message);
  }
  return stripe.billingPortal.sessions.create(params);
}

export async function resolveStripePriceId(stripe) {
  const direct = configuredPriceId();
  if (direct) return direct;

  const productId = configuredProductId();
  if (!productId) {
    throw new Error("Set STRIPE_PRICE_ID or STRIPE_PRODUCT_ID.");
  }

  const product = await stripe.products.retrieve(productId, { expand: ["default_price"] });
  if (!product.active) {
    throw new Error("The Stripe product is archived.");
  }

  const defaultPrice = product.default_price;
  if (typeof defaultPrice === "string" && defaultPrice.startsWith("price_")) return defaultPrice;
  if (defaultPrice?.id) return defaultPrice.id;

  const list = await stripe.prices.list({ product: productId, active: true, limit: 20 });
  const recurring = list.data.find((price) => price.recurring);
  if (recurring?.id) return recurring.id;

  throw new Error("This Stripe product has no active recurring price. Add a monthly price in the Stripe dashboard.");
}

export async function upsertSubscriptionFromStripe(db, { businessId, customerId, subscription }) {
  const existing = await db.getSubscriptionByBusinessId(businessId);
  const status = subscription?.status || existing?.status || "trialing";
  const trialEndsAt = existing?.trial_ends_at || nowIso();

  if (existing) {
    await db.updateSubscription(businessId, {
      stripe_customer_id: customerId || existing.stripe_customer_id,
      stripe_subscription_id: subscription?.id || existing.stripe_subscription_id,
      status,
    });
    return;
  }

  await db.insertSubscription({
    id: randomUUID(),
    business_id: businessId,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription?.id || null,
    status,
    trial_ends_at: trialEndsAt,
    created_at: nowIso(),
  });
}

export async function findBusinessByStripeCustomer(db, stripeCustomerId) {
  return db.getSubscriptionByStripeCustomer(stripeCustomerId);
}

export async function findBusinessByStripeSubscription(db, stripeSubscriptionId) {
  return db.getSubscriptionByStripeSubscription(stripeSubscriptionId);
}
