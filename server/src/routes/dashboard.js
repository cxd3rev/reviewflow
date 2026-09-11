import express from "express";
import { mapJob } from "../db.js";
import { getEntitlement } from "../middleware/auth.js";

export function dashboardRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const businessId = req.business.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = await db.dashboardStats(businessId, startOfMonth.toISOString());
    const recent = await db.recentJobs(businessId);
    const subscription = await db.getSubscriptionByBusinessId(businessId);

    res.json({
      stats,
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
