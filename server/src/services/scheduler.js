import { getEntitlement } from "../middleware/auth.js";
import { sendReviewEmail } from "./email.js";

let running = false;

export function startScheduler(db) {
  const tick = () =>
    processDueRequests(db).catch((error) => {
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
    const due = await db.listDueRequests(new Date().toISOString());
    let sent = 0;
    let failed = 0;

    for (const request of due) {
      const claimed = await db.claimRequest(request.id);
      if (claimed.changes !== 1) continue;

      try {
        const business = await db.getBusinessById(request.business_id);
        const customer = await db.getCustomer(request.customer_id, request.business_id);
        const job = await db.getJob(request.job_id, request.business_id);
        const subscription = await db.getSubscriptionByBusinessId(request.business_id);
        const entitlement = getEntitlement(subscription);

        if (!entitlement.allowed) {
          await db.failRequest(request.id, "Subscription inactive. Request was not sent.");
          failed += 1;
          continue;
        }

        if (!job || job.status === "cancelled") {
          await db.cancelRequest(request.id);
          continue;
        }

        if (!customer?.email) {
          await db.failRequest(request.id, "This customer doesn't have an email address.");
          failed += 1;
          continue;
        }

        const reviewUrl = business?.review_url || request.review_url;
        await sendReviewEmail({ business, customer, reviewUrl });
        await db.markRequestSent(request.id, new Date().toISOString(), reviewUrl);
        sent += 1;
      } catch (error) {
        await db.failRequest(request.id, error.message || "Failed to send email.");
        failed += 1;
      }
    }

    return { processed: due.length, sent, failed };
  } finally {
    running = false;
  }
}
