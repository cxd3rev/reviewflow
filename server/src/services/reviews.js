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

export async function createReviewRequest(db, { business, customer, job, sendAutomatically }) {
  const check = canScheduleReview({ business, customer, sendAutomatically });
  if (!check.ok) {
    return check;
  }

  const existing = await db.getRequestByJob(job.id, business.id);
  if (existing) {
    return { ok: false, skipped: true, reason: "duplicate", requestId: existing.id };
  }

  const delayMinutes = Number(business.review_delay_minutes || 0);
  const scheduledAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
  const id = randomUUID();

  await db.insertRequest({
    id,
    business_id: business.id,
    customer_id: customer.id,
    job_id: job.id,
    scheduled_at: scheduledAt,
    sent_at: null,
    status: "scheduled",
    error_message: null,
    review_url: business.review_url,
    created_at: nowIso(),
  });

  return { ok: true, requestId: id, scheduledAt };
}

export async function cancelUnsentRequests(db, { jobId, businessId }) {
  await db.cancelUnsentForJob(jobId, businessId);
}
