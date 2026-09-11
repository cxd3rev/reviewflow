import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { DEFAULT_EMAIL_MESSAGE, DEFAULT_EMAIL_SUBJECT, nowIso } from "./db.js";
import { createStore } from "./store/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data in production.");
  process.exit(1);
}

const db = await createStore();
const email = "aron@starywrld.test";
const existing = await db.getUserByEmail(email);
if (existing) {
  console.log("Demo account already exists: aron@starywrld.test / Demo1234!");
  process.exit(0);
}

const tablesOk = await db.pingTables();
if (!tablesOk) {
  console.error("Cannot seed: Supabase tables are missing. Run supabase/schema.sql in the SQL editor first.");
  process.exit(1);
}

const createdAt = nowIso();
const userId = randomUUID();
const businessId = randomUUID();
const passwordHash = bcrypt.hashSync("Demo1234!", 12);
const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

await db.insertUser({
  id: userId,
  name: "Aron",
  email,
  password_hash: passwordHash,
  created_at: createdAt,
});
await db.insertBusiness({
  id: businessId,
  user_id: userId,
  name: "Aron's Painting",
  type: "Painter",
  review_url: "https://www.google.com/maps",
  review_delay_minutes: 0,
  automation_enabled: true,
  sender_name: "Aron's Painting",
  email_subject: DEFAULT_EMAIL_SUBJECT,
  email_message: DEFAULT_EMAIL_MESSAGE,
  onboarding_complete: true,
  created_at: createdAt,
});
await db.insertSubscription({
  id: randomUUID(),
  business_id: businessId,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  status: "trialing",
  trial_ends_at: trialEndsAt,
  created_at: createdAt,
});

const customers = [];
for (const c of [
  { first: "John", last: "Smith", mail: "john.smith@example.com", phone: "555-0101" },
  { first: "Sarah", last: "Johnson", mail: "sarah.johnson@example.com", phone: "555-0102" },
  { first: "Michael", last: "Brown", mail: "michael.brown@example.com", phone: "555-0103" },
]) {
  const id = randomUUID();
  await db.insertCustomer({
    id,
    business_id: businessId,
    first_name: c.first,
    last_name: c.last,
    email: c.mail,
    phone: c.phone,
    notes: null,
    created_at: createdAt,
  });
  customers.push({ id, ...c });
}

const jobs = [
  { customer: customers[0], title: "Interior painting", status: "completed", daysAgo: 2 },
  { customer: customers[1], title: "Kitchen renovation", status: "in_progress", daysAgo: 0 },
  { customer: customers[2], title: "Living room painting", status: "completed", daysAgo: 1 },
];

for (const job of jobs) {
  const jobId = randomUUID();
  const completedAt =
    job.status === "completed" ? new Date(Date.now() - job.daysAgo * 24 * 60 * 60 * 1000).toISOString() : null;
  await db.insertJob({
    id: jobId,
    business_id: businessId,
    customer_id: job.customer.id,
    title: job.title,
    description: "Demo job for local development.",
    completed_at: completedAt,
    status: job.status,
    created_at: createdAt,
  });

  if (job.status === "completed") {
    const scheduledAt = new Date(Date.now() - (job.daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString();
    const sent = job.daysAgo >= 1;
    await db.insertRequest({
      id: randomUUID(),
      business_id: businessId,
      customer_id: job.customer.id,
      job_id: jobId,
      scheduled_at: scheduledAt,
      sent_at: sent ? scheduledAt : null,
      status: sent ? "sent" : "scheduled",
      error_message: null,
      review_url: "https://www.google.com/maps",
      created_at: createdAt,
    });
  }
}

console.log("Demo data ready.");
console.log("Login: aron@starywrld.test");
console.log("Password: Demo1234!");
