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

export function upsertSubscriptionFromStripe(db, { businessId, customerId, subscription }) {
  const existing = db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(businessId);
  const status = subscription?.status || existing?.status || "trialing";
  const trialEndsAt = existing?.trial_ends_at || nowIso();

  if (existing) {
    db.prepare(
      `UPDATE subscriptions
       SET stripe_customer_id = COALESCE(?, stripe_customer_id),
           stripe_subscription_id = COALESCE(?, stripe_subscription_id),
           status = ?
       WHERE business_id = ?`
    ).run(customerId || null, subscription?.id || null, status, businessId);
    return;
  }

  db.prepare(
    `INSERT INTO subscriptions (
      id, business_id, stripe_customer_id, stripe_subscription_id, status, trial_ends_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), businessId, customerId || null, subscription?.id || null, status, trialEndsAt, nowIso());
}

export function findBusinessByStripeCustomer(db, stripeCustomerId) {
  return db.prepare("SELECT * FROM subscriptions WHERE stripe_customer_id = ?").get(stripeCustomerId);
}

export function findBusinessByStripeSubscription(db, stripeSubscriptionId) {
  return db.prepare("SELECT * FROM subscriptions WHERE stripe_subscription_id = ?").get(stripeSubscriptionId);
}
