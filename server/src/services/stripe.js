import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import { nowIso } from "../db.js";

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const price = process.env.STRIPE_PRICE_ID || "";
  const keyOk = /^sk_(test|live)_/.test(key) && !/your_key/i.test(key) && key.length > 24;
  const priceOk = /^price_/.test(price) && !/your_price/i.test(price) && price.length > 10;
  return keyOk && priceOk;
}

/** @returns {any} */
export function getStripe() {
  if (!isStripeConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function billingInfo() {
  return {
    stripeConfigured: isStripeConfigured(),
    provider: isStripeConfigured() ? "stripe" : "local",
  };
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
