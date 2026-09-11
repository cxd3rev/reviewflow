import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import express from "express";
import {
  DEFAULT_EMAIL_MESSAGE,
  DEFAULT_EMAIL_SUBJECT,
  mapBusiness,
  nowIso,
  publicUser,
  withTransaction,
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

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const userId = randomUUID();
    const businessId = randomUUID();
    const subscriptionId = randomUUID();
    const createdAt = nowIso();
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const passwordHash = await bcrypt.hash(password, 12);

    withTransaction(db, () => {
      db.prepare(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, name, email, passwordHash, createdAt);

      db.prepare(
        `INSERT INTO businesses (
          id, user_id, name, type, review_url, review_delay_minutes, automation_enabled,
          sender_name, email_subject, email_message, onboarding_complete, created_at
        ) VALUES (?, ?, ?, NULL, NULL, 1440, 1, ?, ?, ?, 0, ?)`
      ).run(
        businessId,
        userId,
        businessName,
        businessName,
        DEFAULT_EMAIL_SUBJECT,
        DEFAULT_EMAIL_MESSAGE,
        createdAt
      );

      db.prepare(
        `INSERT INTO subscriptions (
          id, business_id, stripe_customer_id, stripe_subscription_id, status, trial_ends_at, created_at
        ) VALUES (?, ?, NULL, NULL, 'trialing', ?, ?)`
      ).run(subscriptionId, businessId, trialEndsAt, createdAt);
    });

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    const business = db.prepare("SELECT * FROM businesses WHERE id = ?").get(businessId);
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

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const business = db.prepare("SELECT * FROM businesses WHERE user_id = ?").get(user.id);
    res.json({
      token: signToken(user.id),
      user: publicUser(user),
      business: mapBusiness(business),
    });
  });

  router.post("/logout", (_req, res) => {
    res.json({ ok: true });
  });

  router.get("/me", authRequired(db), (req, res) => {
    const subscription = db
      .prepare("SELECT * FROM subscriptions WHERE business_id = ?")
      .get(req.business.id);
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

    const taken = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(email, req.user.id);
    if (taken) {
      return res.status(409).json({ error: "That email is already in use." });
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters." });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      db.prepare("UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?").run(
        name,
        email,
        passwordHash,
        req.user.id
      );
    } else {
      db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, req.user.id);
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
    res.json({ user: publicUser(user) });
  });

  return router;
}
