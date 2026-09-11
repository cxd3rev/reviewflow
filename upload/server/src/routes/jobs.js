import { randomUUID } from "node:crypto";
import express from "express";
import { mapJob, nowIso, withTransaction } from "../db.js";
import { cancelUnsentRequests, createReviewRequest } from "../services/reviews.js";
import { optionalTrim, requireFields, trim } from "../utils/validation.js";

const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

function jobWithCustomer(db, jobId, businessId) {
  return db
    .prepare(
      `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
              customers.email AS customer_email
       FROM jobs
       JOIN customers ON customers.id = jobs.customer_id
       WHERE jobs.id = ? AND jobs.business_id = ?`
    )
    .get(jobId, businessId);
}

export function jobRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const rows = db
      .prepare(
        `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
                customers.email AS customer_email
         FROM jobs
         JOIN customers ON customers.id = jobs.customer_id
         WHERE jobs.business_id = ?
         ORDER BY jobs.created_at DESC`
      )
      .all(req.business.id);
    res.json({ jobs: rows.map(mapJob) });
  });

  router.post("/", (req, res) => {
    const missing = requireFields(req.body || {}, ["customerId", "title"]);
    if (missing.length) {
      return res.status(400).json({ error: "Customer and job name are required." });
    }

    const customer = db
      .prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?")
      .get(req.body.customerId, req.business.id);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found." });
    }

    const status = STATUSES.includes(req.body.status) ? req.body.status : "scheduled";
    const id = randomUUID();
    const completedAt = status === "completed" ? nowIso() : null;

    db.prepare(
      `INSERT INTO jobs (
        id, business_id, customer_id, title, description, completed_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      req.business.id,
      customer.id,
      trim(req.body.title),
      optionalTrim(req.body.description),
      completedAt,
      status,
      nowIso()
    );

    let reviewRequest = null;
    if (status === "completed") {
      reviewRequest = createReviewRequest(db, {
        business: req.businessRow,
        customer,
        job: { id },
        sendAutomatically: req.body.sendAutomatically !== false,
      });
    }

    res.status(201).json({ job: mapJob(jobWithCustomer(db, id, req.business.id)), reviewRequest });
  });

  router.put("/:id", (req, res) => {
    const existing = db
      .prepare("SELECT * FROM jobs WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Job not found." });

    const customerId = req.body?.customerId || existing.customer_id;
    const customer = db
      .prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?")
      .get(customerId, req.business.id);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found." });
    }

    const title = trim(req.body?.title) || existing.title;
    const description =
      req.body?.description !== undefined ? optionalTrim(req.body.description) : existing.description;
    const status = STATUSES.includes(req.body?.status) ? req.body.status : existing.status;

    let completedAt = existing.completed_at;
    let reviewRequest = null;

    if (status === "completed") {
      completedAt = completedAt || nowIso();
    } else {
      completedAt = null;
    }

    if (existing.status === "completed" && status !== "completed") {
      cancelUnsentRequests(db, { jobId: existing.id, businessId: req.business.id });
    }

    if (status === "cancelled") {
      cancelUnsentRequests(db, { jobId: existing.id, businessId: req.business.id });
    }

    db.prepare(
      `UPDATE jobs
       SET customer_id = ?, title = ?, description = ?, completed_at = ?, status = ?
       WHERE id = ? AND business_id = ?`
    ).run(customer.id, title, description, completedAt, status, existing.id, req.business.id);

    if (status === "completed" && existing.status !== "completed") {
      reviewRequest = createReviewRequest(db, {
        business: req.businessRow,
        customer,
        job: { id: existing.id },
        sendAutomatically: req.body.sendAutomatically !== false,
      });
    }

    res.json({
      job: mapJob(jobWithCustomer(db, existing.id, req.business.id)),
      reviewRequest,
    });
  });

  router.delete("/:id", (req, res) => {
    const existing = db
      .prepare("SELECT id FROM jobs WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Job not found." });

    withTransaction(db, () => {
      db.prepare("DELETE FROM review_requests WHERE job_id = ? AND business_id = ?").run(
        existing.id,
        req.business.id
      );
      db.prepare("DELETE FROM jobs WHERE id = ? AND business_id = ?").run(existing.id, req.business.id);
    });

    res.json({ ok: true });
  });

  return router;
}
