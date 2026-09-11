CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  review_url TEXT,
  review_delay_minutes INTEGER NOT NULL DEFAULT 1440,
  automation_enabled INTEGER NOT NULL DEFAULT 1,
  sender_name TEXT,
  email_subject TEXT,
  email_message TEXT,
  onboarding_complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS review_requests (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  sent_at TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  error_message TEXT,
  review_url TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (job_id) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  trial_ends_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_business ON review_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_requests_due ON review_requests(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_requests_job ON review_requests(job_id);
