import { randomUUID } from "node:crypto";
import express from "express";
import { mapJob, nowIso } from "../db.js";
import { cancelUnsentRequests, createReviewRequest } from "../services/reviews.js";
import { optionalTrim, requireFields, trim } from "../utils/validation.js";

const STATUSES = ["scheduled", "in_progress", "completed", "cancelled"];

export function jobRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const rows = await db.listJobs(req.business.id);
    res.json({ jobs: rows.map(mapJob) });
  });

  router.post("/", async (req, res) => {
    const missing = requireFields(req.body || {}, ["customerId", "title"]);
    if (missing.length) {
      return res.status(400).json({ error: "Customer and job name are required." });
    }

    const customer = await db.getCustomer(req.body.customerId, req.business.id);
    if (!customer) {
      return res.status(400).json({ error: "Customer not found." });
    }

    const status = STATUSES.includes(req.body.status) ? req.body.status : "scheduled";
    const id = randomUUID();
    const completedAt = status === "completed" ? nowIso() : null;

    await db.insertJob({
      id,
      business_id: req.business.id,
      customer_id: customer.id,
      title: trim(req.body.title),
      description: optionalTrim(req.body.description),
      completed_at: completedAt,
      status,
      created_at: nowIso(),
    });

    let reviewRequest = null;
    if (status === "completed") {
      reviewRequest = await createReviewRequest(db, {
        business: req.businessRow,
        customer,
        job: { id },
        sendAutomatically: req.body.sendAutomatically !== false,
      });
    }

    res.status(201).json({ job: mapJob(await db.getJobWithCustomer(id, req.business.id)), reviewRequest });
  });

  router.put("/:id", async (req, res) => {
    const existing = await db.getJob(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Job not found." });

    const customerId = req.body?.customerId || existing.customer_id;
    const customer = await db.getCustomer(customerId, req.business.id);
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
      await cancelUnsentRequests(db, { jobId: existing.id, businessId: req.business.id });
    }

    if (status === "cancelled") {
      await cancelUnsentRequests(db, { jobId: existing.id, businessId: req.business.id });
    }

    await db.updateJob(existing.id, req.business.id, {
      customer_id: customer.id,
      title,
      description,
      completed_at: completedAt,
      status,
    });

    if (status === "completed" && existing.status !== "completed") {
      reviewRequest = await createReviewRequest(db, {
        business: req.businessRow,
        customer,
        job: { id: existing.id },
        sendAutomatically: req.body.sendAutomatically !== false,
      });
    }

    res.json({
      job: mapJob(await db.getJobWithCustomer(existing.id, req.business.id)),
      reviewRequest,
    });
  });

  router.delete("/:id", async (req, res) => {
    const existing = await db.getJob(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Job not found." });
    await db.deleteJobCascade(existing.id, req.business.id);
    res.json({ ok: true });
  });

  return router;
}
