import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { openDatabase } from "./db.js";
import { authRequired } from "./middleware/auth.js";
import { requireAccess } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { billingRoutes, stripeWebhookHandler } from "./routes/billing.js";
import { businessRoutes } from "./routes/business.js";
import { customerRoutes } from "./routes/customers.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { jobRoutes } from "./routes/jobs.js";
import { requestRoutes } from "./routes/requests.js";
import { startScheduler } from "./services/scheduler.js";
import { attachSupabase, supabaseEnvStatus } from "./services/supabase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required. Copy .env.example to .env and set it.");
  process.exit(1);
}

const db = openDatabase();
db.prepare(
  `UPDATE review_requests SET status = 'scheduled' WHERE status = 'sending'`
).run();

const app = express();
const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.disable("x-powered-by");
app.use(
  cors({
    origin,
    credentials: true,
  })
);

app.post(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler(db)
);

app.use(express.json({ limit: "100kb" }));
app.use(attachSupabase);

app.get("/api/health", (_req, res) => {
  const supabase = supabaseEnvStatus();
  res.json({
    ok: true,
    service: "reviewflow",
    supabase: { configured: supabase.configured, url: supabase.url },
  });
});

app.use("/api/auth", authRoutes(db));
app.use("/api/business", authRequired(db), businessRoutes(db));
app.use("/api/customers", authRequired(db), requireAccess(db), customerRoutes(db));
app.use("/api/jobs", authRequired(db), requireAccess(db), jobRoutes(db));
app.use("/api/requests", authRequired(db), requireAccess(db), requestRoutes(db));
app.use("/api/dashboard", authRequired(db), dashboardRoutes(db));
app.use("/api/billing", authRequired(db), billingRoutes(db));

if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(__dirname, "../../client/dist");
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "Not found." });
      }
      res.sendFile(path.join(dist, "index.html"));
    });
  }
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`ReviewFlow API running on http://localhost:${port}`);
  startScheduler(db);
});
