import express from "express";
import { mapJob } from "../db.js";
import { getEntitlement } from "../middleware/auth.js";

export function dashboardRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const businessId = req.business.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedJobs = db
      .prepare("SELECT COUNT(*) AS count FROM jobs WHERE business_id = ? AND status = 'completed'")
      .get(businessId).count;
    const requestsSent = db
      .prepare("SELECT COUNT(*) AS count FROM review_requests WHERE business_id = ? AND status = 'sent'")
      .get(businessId).count;
    const pending = db
      .prepare("SELECT COUNT(*) AS count FROM review_requests WHERE business_id = ? AND status = 'scheduled'")
      .get(businessId).count;
    const thisMonth = db
      .prepare(
        `SELECT COUNT(*) AS count FROM review_requests
         WHERE business_id = ? AND status = 'sent' AND sent_at >= ?`
      )
      .get(businessId, startOfMonth.toISOString()).count;

    const recent = db
      .prepare(
        `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
                (
                  SELECT review_requests.scheduled_at
                  FROM review_requests
                  WHERE review_requests.job_id = jobs.id
                  ORDER BY review_requests.created_at DESC
                  LIMIT 1
                ) AS request_scheduled_at,
                (
                  SELECT review_requests.status
                  FROM review_requests
                  WHERE review_requests.job_id = jobs.id
                  ORDER BY review_requests.created_at DESC
                  LIMIT 1
                ) AS request_status
         FROM jobs
         JOIN customers ON customers.id = jobs.customer_id
         WHERE jobs.business_id = ?
         ORDER BY COALESCE(jobs.completed_at, jobs.created_at) DESC
         LIMIT 8`
      )
      .all(businessId);

    const subscription = db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(businessId);

    res.json({
      stats: {
        completedJobs,
        requestsSent,
        pending,
        thisMonth,
      },
      recentJobs: recent.map((row) => ({
        ...mapJob(row),
        requestScheduledAt: row.request_scheduled_at,
        requestStatus: row.request_status,
      })),
      entitlement: getEntitlement(subscription),
    });
  });

  return router;
}
