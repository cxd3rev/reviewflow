import express from "express";
import { mapRequest } from "../db.js";

export function requestRoutes(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const status = String(req.query.status || "all");
    const allowed = ["all", "scheduled", "sent", "failed", "cancelled"];
    const filter = allowed.includes(status) ? status : "all";
    const rows = await db.listRequests(req.business.id, filter);
    res.json({ requests: rows.map(mapRequest) });
  });

  router.post("/:id/cancel", async (req, res) => {
    const existing = await db.getRequest(req.params.id, req.business.id);
    if (!existing) return res.status(404).json({ error: "Request not found." });
    if (existing.status !== "scheduled") {
      return res.status(400).json({ error: "Only scheduled requests can be cancelled." });
    }

    await db.cancelScheduledRequest(existing.id, req.business.id);
    const row = await db.getRequest(existing.id, req.business.id);
    res.json({ request: mapRequest(row) });
  });

  return router;
}
