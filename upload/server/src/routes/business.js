import express from "express";
import { mapBusiness } from "../db.js";
import { isSafeHttpUrl, trim } from "../utils/validation.js";

const DELAYS = [0, 60, 1440, 2880, 4320];
const TYPES = [
  "Plumber",
  "Electrician",
  "Cleaner",
  "Painter",
  "Mechanic",
  "Contractor",
  "Landscaper",
  "Barber",
  "Beauty",
  "Handyman",
  "Other",
];

export function businessRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({ business: req.business });
  });

  router.put("/onboarding", (req, res) => {
    const name = trim(req.body?.name) || req.business.name;
    const type = trim(req.body?.type);
    const reviewUrl = trim(req.body?.reviewUrl);
    const delay = Number(req.body?.reviewDelayMinutes);
    const reviewDelayMinutes = DELAYS.includes(delay) ? delay : 1440;

    if (!name) {
      return res.status(400).json({ error: "Business name is required." });
    }
    if (reviewUrl && !isSafeHttpUrl(reviewUrl)) {
      return res.status(400).json({ error: "Please enter a valid review URL, starting with https://" });
    }

    db.prepare(
      `UPDATE businesses
       SET name = ?, type = ?, review_url = ?, review_delay_minutes = ?, sender_name = ?, onboarding_complete = 1
       WHERE id = ? AND user_id = ?`
    ).run(
      name,
      type || null,
      reviewUrl || null,
      reviewDelayMinutes,
      name,
      req.business.id,
      req.user.id
    );

    const business = db.prepare("SELECT * FROM businesses WHERE id = ?").get(req.business.id);
    res.json({ business: mapBusiness(business) });
  });

  router.put("/", (req, res) => {
    const current = req.businessRow;
    const name = req.body?.name !== undefined ? trim(req.body.name) : current.name;
    const type = req.body?.type !== undefined ? trim(req.body.type) : current.type;
    const reviewUrl = req.body?.reviewUrl !== undefined ? trim(req.body.reviewUrl) : current.review_url;
    const senderName = req.body?.senderName !== undefined ? trim(req.body.senderName) : current.sender_name;
    const emailSubject = req.body?.emailSubject !== undefined ? String(req.body.emailSubject) : current.email_subject;
    const emailMessage = req.body?.emailMessage !== undefined ? String(req.body.emailMessage) : current.email_message;
    const automationEnabled =
      req.body?.automationEnabled !== undefined
        ? req.body.automationEnabled
          ? 1
          : 0
        : current.automation_enabled;
    const delay = req.body?.reviewDelayMinutes !== undefined ? Number(req.body.reviewDelayMinutes) : current.review_delay_minutes;
    const reviewDelayMinutes = DELAYS.includes(delay) ? delay : current.review_delay_minutes;

    if (!name) {
      return res.status(400).json({ error: "Business name is required." });
    }
    if (reviewUrl && !isSafeHttpUrl(reviewUrl)) {
      return res.status(400).json({ error: "Please enter a valid review URL, starting with https://" });
    }

    db.prepare(
      `UPDATE businesses
       SET name = ?, type = ?, review_url = ?, review_delay_minutes = ?, automation_enabled = ?,
           sender_name = ?, email_subject = ?, email_message = ?
       WHERE id = ? AND user_id = ?`
    ).run(
      name,
      type || null,
      reviewUrl || null,
      reviewDelayMinutes,
      automationEnabled,
      senderName || name,
      emailSubject,
      emailMessage,
      req.business.id,
      req.user.id
    );

    const business = db.prepare("SELECT * FROM businesses WHERE id = ?").get(req.business.id);
    res.json({ business: mapBusiness(business) });
  });

  return router;
}

export { DELAYS, TYPES };
