import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_EMAIL_MESSAGE,
  DEFAULT_EMAIL_SUBJECT,
  nowIso,
  openDatabase,
  withTransaction,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data in production.");
  process.exit(1);
}

const db = openDatabase();
const email = "aron@starywrld.test";
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.log("Demo account already exists: aron@starywrld.test / Demo1234!");
  process.exit(0);
}

const createdAt = nowIso();
const userId = randomUUID();
const businessId = randomUUID();
const passwordHash = bcrypt.hashSync("Demo1234!", 12);
const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

withTransaction(db, () => {
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(userId, "Aron", email, passwordHash, createdAt);

  db.prepare(
    `INSERT INTO businesses (
      id, user_id, name, type, review_url, review_delay_minutes, automation_enabled,
      sender_name, email_subject, email_message, onboarding_complete, created_at
    ) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, ?, 1, ?)`
  ).run(
    businessId,
    userId,
    "Aron's Painting",
    "Painter",
    "https://www.google.com/maps",
    "Aron's Painting",
    DEFAULT_EMAIL_SUBJECT,
    DEFAULT_EMAIL_MESSAGE,
    createdAt
  );

  db.prepare(
    `INSERT INTO subscriptions (
      id, business_id, stripe_customer_id, stripe_subscription_id, status, trial_ends_at, created_at
    ) VALUES (?, ?, NULL, NULL, 'trialing', ?, ?)`
  ).run(randomUUID(), businessId, trialEndsAt, createdAt);

  const customers = [
    { first: "John", last: "Smith", mail: "john.smith@example.com", phone: "555-0101" },
    { first: "Sarah", last: "Johnson", mail: "sarah.johnson@example.com", phone: "555-0102" },
    { first: "Michael", last: "Brown", mail: "michael.brown@example.com", phone: "555-0103" },
  ].map((c) => {
    const id = randomUUID();
    db.prepare(
      `INSERT INTO customers (id, business_id, first_name, last_name, email, phone, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, businessId, c.first, c.last, c.mail, c.phone, null, createdAt);
    return { id, ...c };
  });

  const jobs = [
    { customer: customers[0], title: "Interior painting", status: "completed", daysAgo: 2 },
    { customer: customers[1], title: "Kitchen renovation", status: "in_progress", daysAgo: 0 },
    { customer: customers[2], title: "Living room painting", status: "completed", daysAgo: 1 },
  ];

  for (const job of jobs) {
    const jobId = randomUUID();
    const completedAt =
      job.status === "completed"
        ? new Date(Date.now() - job.daysAgo * 24 * 60 * 60 * 1000).toISOString()
        : null;
    db.prepare(
      `INSERT INTO jobs (id, business_id, customer_id, title, description, completed_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      jobId,
      businessId,
      job.customer.id,
      job.title,
      "Demo job for local development.",
      completedAt,
      job.status,
      createdAt
    );

    if (job.status === "completed") {
      const scheduledAt = new Date(Date.now() - (job.daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString();
      const sent = job.daysAgo >= 1;
      db.prepare(
        `INSERT INTO review_requests (
          id, business_id, customer_id, job_id, scheduled_at, sent_at, status, error_message, review_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`
      ).run(
        randomUUID(),
        businessId,
        job.customer.id,
        jobId,
        scheduledAt,
        sent ? scheduledAt : null,
        sent ? "sent" : "scheduled",
        "https://www.google.com/maps",
        createdAt
      );
    }
  }
});

console.log("Demo data ready.");
console.log("Login: aron@starywrld.test");
console.log("Password: Demo1234!");
