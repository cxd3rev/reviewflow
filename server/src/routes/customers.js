import { randomUUID } from "node:crypto";
import express from "express";
import { mapCustomer, nowIso } from "../db.js";
import { isValidEmail, optionalTrim, requireFields, trim } from "../utils/validation.js";

export function customerRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const rows = await db.listCustomers(req.business.id);
    res.json({ customers: rows.map(mapCustomer) });
  });

  router.get("/:id", async (req, res) => {
    const row = await db.getCustomer(req.params.id, req.business.id);
    if (!row) return res.status(404).json({ error: "Customer not found." });
    res.json({ customer: mapCustomer(row) });
  });

  router.post("/", async (req, res) => {
    const missing = requireFields(req.body || {}, ["firstName", "lastName"]);
    if (missing.length) {
      return res.status(400).json({ error: "First name and last name are required." });
    }

    const email = optionalTrim(req.body.email)?.toLowerCase() || null;
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const id = randomUUID();
    await db.insertCustomer({
      id,
      business_id: req.business.id,
      first_name: trim(req.body.firstName),
      last_name: trim(req.body.lastName),
      email,
      phone: optionalTrim(req.body.phone),
      notes: optionalTrim(req.body.notes),
      created_at: nowIso(),
    });

    const row = await db.getCustomer(id, req.business.id);
    res.status(201).json({ customer: mapCustomer(row) });
  });

  router.put("/:id", async (req, res) => {
    const existing = await db.getCustomer(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Customer not found." });

    const firstName = trim(req.body?.firstName) || existing.first_name;
    const lastName = trim(req.body?.lastName) || existing.last_name;
    const email =
      req.body?.email !== undefined ? optionalTrim(req.body.email)?.toLowerCase() || null : existing.email;
    const phone = req.body?.phone !== undefined ? optionalTrim(req.body.phone) : existing.phone;
    const notes = req.body?.notes !== undefined ? optionalTrim(req.body.notes) : existing.notes;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    await db.updateCustomer(existing.id, req.business.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      notes,
    });

    const row = await db.getCustomer(existing.id, req.business.id);
    res.json({ customer: mapCustomer(row) });
  });

  router.delete("/:id", async (req, res) => {
    const existing = await db.getCustomer(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Customer not found." });
    await db.deleteCustomerCascade(existing.id, req.business.id);
    res.json({ ok: true });
  });

  return router;
}
