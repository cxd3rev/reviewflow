import { getEntitlement } from "../middleware/auth.js";
import { sendReviewEmail } from "./email.js";

let running = false;

export function startScheduler(db) {
  const tick = () => processDueRequests(db).catch((error) => {
    console.error("[scheduler]", error);
  });

  tick();
  const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS || 15000);
  setInterval(tick, intervalMs);
  console.log(`Scheduler started (every ${intervalMs / 1000}s)`);
}

export async function processDueRequests(db) {
  if (running) return { skipped: true };
  running = true;

  try {
    const due = db.prepare(
      `SELECT * FROM review_requests
       WHERE status = 'scheduled' AND scheduled_at <= ?
       ORDER BY scheduled_at ASC
       LIMIT 25`
    ).all(new Date().toISOString());

    let sent = 0;
    let failed = 0;

    for (const request of due) {
      const claimed = db.prepare(
        `UPDATE review_requests
         SET status = 'sending'
         WHERE id = ? AND status = 'scheduled'`
      ).run(request.id);

      if (claimed.changes !== 1) continue;

      try {
        const business = db.prepare("SELECT * FROM businesses WHERE id = ?").get(request.business_id);
        const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(request.customer_id);
        const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(request.job_id);
        const subscription = db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(request.business_id);
        const entitlement = getEntitlement(subscription);

        if (!entitlement.allowed) {
          db.prepare(
            `UPDATE review_requests
             SET status = 'failed', error_message = ?
             WHERE id = ?`
          ).run("Subscription inactive. Request was not sent.", request.id);
          failed += 1;
          continue;
        }

        if (!job || job.status === "cancelled") {
          db.prepare(
            `UPDATE review_requests
             SET status = 'cancelled', error_message = NULL
             WHERE id = ?`
          ).run(request.id);
          continue;
        }

        if (!customer?.email) {
          db.prepare(
            `UPDATE review_requests
             SET status = 'failed', error_message = ?
             WHERE id = ?`
          ).run("This customer doesn't have an email address.", request.id);
          failed += 1;
          continue;
        }

        const reviewUrl = business?.review_url || request.review_url;
        await sendReviewEmail({ business, customer, reviewUrl });

        db.prepare(
          `UPDATE review_requests
           SET status = 'sent', sent_at = ?, error_message = NULL, review_url = ?
           WHERE id = ? AND status = 'sending'`
        ).run(new Date().toISOString(), reviewUrl, request.id);
        sent += 1;
      } catch (error) {
        db.prepare(
          `UPDATE review_requests
           SET status = 'failed', error_message = ?
           WHERE id = ?`
        ).run(error.message || "Failed to send email.", request.id);
        failed += 1;
      }
    }

    return { processed: due.length, sent, failed };
  } finally {
    running = false;
  }
}
