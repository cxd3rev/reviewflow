import jwt from "jsonwebtoken";
import { mapBusiness, publicUser } from "../db.js";

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function authRequired(db) {
  return async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Please sign in." });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.getUserById(payload.sub);
      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const business = await db.getBusinessByUserId(user.id);
      req.user = publicUser(user);
      req.userRow = user;
      req.business = mapBusiness(business);
      req.businessRow = business;
      next();
    } catch {
      return res.status(401).json({ error: "Your session has expired. Please sign in again." });
    }
  };
}

export function getEntitlement(subscription) {
  if (!subscription) {
    return {
      allowed: false,
      trialActive: false,
      trialEndsAt: null,
      daysLeft: 0,
      plan: "none",
      status: "none",
    };
  }

  const now = Date.now();
  const trialEnds = new Date(subscription.trial_ends_at).getTime();
  const trialActive = Number.isFinite(trialEnds) && trialEnds > now;
  const subId = String(subscription.stripe_subscription_id || "");
  const hasStripeSub = Boolean(subId) && !subId.startsWith("local_");
  const paidActive =
    hasStripeSub && ["active", "trialing", "past_due"].includes(subscription.status);
  const localPaid = subId.startsWith("local_") && ["active", "trialing"].includes(subscription.status);
  const daysLeft = trialActive ? Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24))) : 0;

  return {
    allowed: trialActive || paidActive || localPaid,
    trialActive: trialActive && !paidActive && !localPaid,
    trialEndsAt: subscription.trial_ends_at,
    daysLeft,
    plan: paidActive || localPaid ? "pro" : trialActive ? "trial" : "none",
    status: subscription.status,
    stripeCustomerId: subscription.stripe_customer_id,
    stripeSubscriptionId: subscription.stripe_subscription_id,
  };
}

export function requireAccess(db) {
  return async (req, res, next) => {
    const subscription = await db.getSubscriptionByBusinessId(req.business?.id);
    const entitlement = getEntitlement(subscription);
    req.entitlement = entitlement;
    if (!entitlement.allowed) {
      return res.status(402).json({
        error: "Your free trial has ended. Subscribe to keep sending review requests.",
        code: "subscription_required",
      });
    }
    next();
  };
}
