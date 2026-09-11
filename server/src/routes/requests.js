import express from "express";
import { mapRequest } from "../db.js";

export function requestRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const status = String(req.query.status || "all");
    const allowed = ["all", "scheduled", "sent", "failed", "cancelled"];
    const filter = allowed.includes(status) ? status : "all";

    const rows =
      filter === "all"
        ? db
            .prepare(
              `SELECT review_requests.*,
                      customers.first_name || ' ' || customers.last_name AS customer_name,
                      jobs.title AS job_title
               FROM review_requests
               JOIN customers ON customers.id = review_requests.customer_id
               JOIN jobs ON jobs.id = review_requests.job_id
               WHERE review_requests.business_id = ?
               ORDER BY review_requests.created_at DESC`
            )
            .all(req.business.id)
        : db
            .prepare(
              `SELECT review_requests.*,
                      customers.first_name || ' ' || customers.last_name AS customer_name,
                      jobs.title AS job_title
               FROM review_requests
               JOIN customers ON customers.id = review_requests.customer_id
               JOIN jobs ON jobs.id = review_requests.job_id
               WHERE review_requests.business_id = ?
                 AND (
                   review_requests.status = ?
                   OR (? = 'scheduled' AND review_requests.status = 'sending')
                 )
               ORDER BY review_requests.created_at DESC`
            )
            .all(req.business.id, filter, filter);

    res.json({ requests: rows.map(mapRequest) });
  });

  router.post("/:id/cancel", (req, res) => {
    const existing = db
      .prepare("SELECT * FROM review_requests WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Request not found." });
    if (existing.status !== "scheduled") {
      return res.status(400).json({ error: "Only scheduled requests can be cancelled." });
    }

    db.prepare(
      `UPDATE review_requests SET status = 'cancelled' WHERE id = ? AND business_id = ? AND status = 'scheduled'`
    ).run(existing.id, req.business.id);

    const row = db
      .prepare(
        `SELECT review_requests.*,
                customers.first_name || ' ' || customers.last_name AS customer_name,
                jobs.title AS job_title
         FROM review_requests
         JOIN customers ON customers.id = review_requests.customer_id
         JOIN jobs ON jobs.id = review_requests.job_id
         WHERE review_requests.id = ? AND review_requests.business_id = ?`
      )
      .get(existing.id, req.business.id);

    res.json({ request: mapRequest(row) });
  });

  return router;
}
