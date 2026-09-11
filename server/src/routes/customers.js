import { randomUUID } from "node:crypto";
import express from "express";
import { mapCustomer, nowIso, withTransaction } from "../db.js";
import { isValidEmail, optionalTrim, requireFields, trim } from "../utils/validation.js";

export function customerRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const rows = db
      .prepare(
        `SELECT * FROM customers WHERE business_id = ? ORDER BY created_at DESC`
      )
      .all(req.business.id);
    res.json({ customers: rows.map(mapCustomer) });
  });

  router.get("/:id", (req, res) => {
    const row = db
      .prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!row) return res.status(404).json({ error: "Customer not found." });
    res.json({ customer: mapCustomer(row) });
  });

  router.post("/", (req, res) => {
    const missing = requireFields(req.body || {}, ["firstName", "lastName"]);
    if (missing.length) {
      return res.status(400).json({ error: "First name and last name are required." });
    }

    const email = optionalTrim(req.body.email)?.toLowerCase() || null;
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const id = randomUUID();
    db.prepare(
      `INSERT INTO customers (
        id, business_id, first_name, last_name, email, phone, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      req.business.id,
      trim(req.body.firstName),
      trim(req.body.lastName),
      email,
      optionalTrim(req.body.phone),
      optionalTrim(req.body.notes),
      nowIso()
    );

    const row = db.prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?").get(id, req.business.id);
    res.status(201).json({ customer: mapCustomer(row) });
  });

  router.put("/:id", (req, res) => {
    const existing = db
      .prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Customer not found." });

    const firstName = trim(req.body?.firstName) || existing.first_name;
    const lastName = trim(req.body?.lastName) || existing.last_name;
    const email = req.body?.email !== undefined ? optionalTrim(req.body.email)?.toLowerCase() || null : existing.email;
    const phone = req.body?.phone !== undefined ? optionalTrim(req.body.phone) : existing.phone;
    const notes = req.body?.notes !== undefined ? optionalTrim(req.body.notes) : existing.notes;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    db.prepare(
      `UPDATE customers
       SET first_name = ?, last_name = ?, email = ?, phone = ?, notes = ?
       WHERE id = ? AND business_id = ?`
    ).run(firstName, lastName, email, phone, notes, existing.id, req.business.id);

    const row = db.prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?").get(existing.id, req.business.id);
    res.json({ customer: mapCustomer(row) });
  });

  router.delete("/:id", (req, res) => {
    const existing = db
      .prepare("SELECT id FROM customers WHERE id = ? AND business_id = ?")
      .get(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Customer not found." });

    withTransaction(db, () => {
      db.prepare("DELETE FROM review_requests WHERE customer_id = ? AND business_id = ?").run(
        existing.id,
        req.business.id
      );
      db.prepare("DELETE FROM jobs WHERE customer_id = ? AND business_id = ?").run(
        existing.id,
        req.business.id
      );
      db.prepare("DELETE FROM customers WHERE id = ? AND business_id = ?").run(
        existing.id,
        req.business.id
      );
    });

    res.json({ ok: true });
  });

  return router;
}
