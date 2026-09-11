import { randomUUID } from "node:crypto";
import { nowIso } from "../db.js";
import { isValidEmail } from "../utils/validation.js";

export function canScheduleReview({ business, customer, sendAutomatically }) {
  if (!sendAutomatically) {
    return { ok: false, skipped: true, reason: "opted_out" };
  }
  if (!business.automation_enabled) {
    return { ok: false, skipped: true, reason: "automation_disabled" };
  }
  if (!customer.email) {
    return { ok: false, error: "This customer doesn't have an email address." };
  }
  if (!isValidEmail(customer.email)) {
    return { ok: false, error: "This customer has an invalid email address." };
  }
  if (!business.review_url) {
    return { ok: false, error: "Add a review URL in Settings before sending review requests." };
  }
  return { ok: true };
}

export function createReviewRequest(db, { business, customer, job, sendAutomatically }) {
  const check = canScheduleReview({ business, customer, sendAutomatically });
  if (!check.ok) {
    return check;
  }

  const existing = db
    .prepare(
      `SELECT id, status FROM review_requests
       WHERE job_id = ? AND business_id = ? AND status IN ('scheduled', 'sent')`
    )
    .get(job.id, business.id);

  if (existing) {
    return { ok: false, skipped: true, reason: "duplicate", requestId: existing.id };
  }

  const delayMinutes = Number(business.review_delay_minutes || 0);
  const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO review_requests (
      id, business_id, customer_id, job_id, scheduled_at, sent_at, status, error_message, review_url, created_at
    ) VALUES (?, ?, ?, ?, ?, NULL, 'scheduled', NULL, ?, ?)`
  ).run(id, business.id, customer.id, job.id, scheduledAt, business.review_url, nowIso());

  return { ok: true, requestId: id, scheduledAt };
}

export function cancelUnsentRequests(db, { jobId, businessId }) {
  db.prepare(
    `UPDATE review_requests
     SET status = 'cancelled'
     WHERE job_id = ? AND business_id = ? AND status = 'scheduled'`
  ).run(jobId, businessId);
}
