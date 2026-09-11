import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function nowIso() {
  return new Date().toISOString();
}

export function publicAppOrigin() {
  const raw = process.env.APP_URL || process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return String(raw).split(",")[0].trim();
}

export function withTransaction(db, fn) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw error;
  }
}

export function openDatabase() {
  const relative = process.env.DATABASE_URL || "./server/database/starywrld.sqlite";
  const dbPath = path.isAbsolute(relative)
    ? relative
    : path.resolve(__dirname, "../..", relative.replace(/^\.\//, ""));

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  const schema = fs.readFileSync(path.join(__dirname, "db/schema.sql"), "utf8");
  db.exec(schema);

  return db;
}

export function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function mapBusiness(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    reviewUrl: row.review_url,
    reviewDelayMinutes: row.review_delay_minutes,
    automationEnabled: Boolean(row.automation_enabled),
    senderName: row.sender_name,
    emailSubject: row.email_subject,
    emailMessage: row.email_message,
    onboardingComplete: Boolean(row.onboarding_complete),
    createdAt: row.created_at,
  };
}

export function mapCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessId: row.business_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id,
    title: row.title,
    description: row.description,
    completedAt: row.completed_at,
    status: row.status,
    createdAt: row.created_at,
    customerName: row.customer_name || null,
    customerEmail: row.customer_email || null,
  };
}

export function mapRequest(row) {
  if (!row) return null;
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id,
    jobId: row.job_id,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
    status: row.status,
    errorMessage: row.error_message,
    reviewUrl: row.review_url,
    createdAt: row.created_at,
    customerName: row.customer_name || null,
    jobTitle: row.job_title || null,
  };
}

export const DEFAULT_EMAIL_SUBJECT = "How did we do?";
export const DEFAULT_EMAIL_MESSAGE = `Hi {{customer_name}},

Thanks for choosing {{business_name}}.

We'd really appreciate it if you could take a moment to leave us a review.

It only takes a minute and helps our business a lot.

Thanks,
{{business_name}}`;
