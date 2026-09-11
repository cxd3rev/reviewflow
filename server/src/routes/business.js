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

  router.put("/onboarding", async (req, res) => {
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

    await db.updateBusiness(req.business.id, req.user.id, {
      name,
      type: type || null,
      review_url: reviewUrl || null,
      review_delay_minutes: reviewDelayMinutes,
      sender_name: name,
      onboarding_complete: true,
    });

    const business = await db.getBusinessById(req.business.id);
    res.json({ business: mapBusiness(business) });
  });

  router.put("/", async (req, res) => {
    const current = req.businessRow;
    const name = req.body?.name !== undefined ? trim(req.body.name) : current.name;
    const type = req.body?.type !== undefined ? trim(req.body.type) : current.type;
    const reviewUrl = req.body?.reviewUrl !== undefined ? trim(req.body.reviewUrl) : current.review_url;
    const senderName = req.body?.senderName !== undefined ? trim(req.body.senderName) : current.sender_name;
    const emailSubject =
      req.body?.emailSubject !== undefined ? String(req.body.emailSubject) : current.email_subject;
    const emailMessage =
      req.body?.emailMessage !== undefined ? String(req.body.emailMessage) : current.email_message;
    const automationEnabled =
      req.body?.automationEnabled !== undefined ? Boolean(req.body.automationEnabled) : current.automation_enabled;
    const delay =
      req.body?.reviewDelayMinutes !== undefined
        ? Number(req.body.reviewDelayMinutes)
        : current.review_delay_minutes;
    const reviewDelayMinutes = DELAYS.includes(delay) ? delay : current.review_delay_minutes;

    if (!name) {
      return res.status(400).json({ error: "Business name is required." });
    }
    if (reviewUrl && !isSafeHttpUrl(reviewUrl)) {
      return res.status(400).json({ error: "Please enter a valid review URL, starting with https://" });
    }

    await db.updateBusiness(req.business.id, req.user.id, {
      name,
      type: type || null,
      review_url: reviewUrl || null,
      review_delay_minutes: reviewDelayMinutes,
      automation_enabled: automationEnabled,
      sender_name: senderName || name,
      email_subject: emailSubject,
      email_message: emailMessage,
    });

    const business = await db.getBusinessById(req.business.id);
    res.json({ business: mapBusiness(business) });
  });

  return router;
}

export { DELAYS, TYPES };
