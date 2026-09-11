import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import express from "express";
import {
  DEFAULT_EMAIL_MESSAGE,
  DEFAULT_EMAIL_SUBJECT,
  mapBusiness,
  nowIso,
  publicUser,
} from "../db.js";
import { authRequired, getEntitlement, signToken } from "../middleware/auth.js";
import { billingInfo } from "../services/stripe.js";
import { isValidEmail, requireFields, trim } from "../utils/validation.js";

export function authRoutes(db) {
  const router = express.Router();

  router.post("/signup", async (req, res) => {
    const missing = requireFields(req.body || {}, ["businessName", "name", "email", "password"]);
    if (missing.length) {
      return res.status(400).json({ error: `Please fill in: ${missing.join(", ")}.` });
    }

    const name = trim(req.body.name);
    const businessName = trim(req.body.businessName);
    const email = trim(req.body.email).toLowerCase();
    const password = String(req.body.password);

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    if (!(await db.pingTables())) {
      return res.status(503).json({
        error: "The hosted database is not ready. Run supabase/schema.sql in the Supabase SQL editor.",
      });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const userId = randomUUID();
    const businessId = randomUUID();
    const createdAt = nowIso();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const passwordHash = await bcrypt.hash(password, 12);

    await db.insertUser({ id: userId, name, email, password_hash: passwordHash, created_at: createdAt });
    await db.insertBusiness({
      id: businessId,
      user_id: userId,
      name: businessName,
      type: null,
      review_url: null,
      review_delay_minutes: 1440,
      automation_enabled: true,
      sender_name: businessName,
      email_subject: DEFAULT_EMAIL_SUBJECT,
      email_message: DEFAULT_EMAIL_MESSAGE,
      onboarding_complete: false,
      created_at: createdAt,
    });
    await db.insertSubscription({
      id: randomUUID(),
      business_id: businessId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      status: "trialing",
      trial_ends_at: trialEndsAt,
      created_at: createdAt,
    });

    const user = await db.getUserById(userId);
    const business = await db.getBusinessById(businessId);
    res.status(201).json({
      token: signToken(userId),
      user: publicUser(user),
      business: mapBusiness(business),
    });
  });

  router.post("/login", async (req, res) => {
    const email = trim(req.body?.email).toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const business = await db.getBusinessByUserId(user.id);
    res.json({
      token: signToken(user.id),
      user: publicUser(user),
      business: mapBusiness(business),
    });
  });

  router.post("/logout", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/me", authRequired(db), async (req, res) => {
    const subscription = await db.getSubscriptionByBusinessId(req.business.id);
    res.json({
      user: req.user,
      business: req.business,
      entitlement: getEntitlement(subscription),
      billing: billingInfo(),
    });
  });

  router.put("/account", authRequired(db), async (req, res) => {
    const name = trim(req.body?.name);
    const email = trim(req.body?.email).toLowerCase();
    const password = req.body?.password ? String(req.body.password) : "";

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const taken = await db.getUserIdByEmailExcept(email, req.user.id);
    if (taken) {
      return res.status(409).json({ error: "That email is already in use." });
    }

    const patch = { name, email };
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters." });
      }
      patch.password_hash = await bcrypt.hash(password, 12);
    }

    await db.updateUser(req.user.id, patch);
    const user = await db.getUserById(req.user.id);
    res.json({ user: publicUser(user) });
  });

  return router;
}
