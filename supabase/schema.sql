-- Run this once in Supabase: SQL Editor → New query → Run.
-- Service role (server secret key) bypasses RLS.

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  name text not null,
  type text,
  review_url text,
  review_delay_minutes integer not null default 1440,
  automation_enabled boolean not null default true,
  sender_name text,
  email_subject text,
  email_message text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  customer_id text not null references public.customers(id) on delete cascade,
  title text not null,
  description text,
  completed_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table if not exists public.review_requests (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  customer_id text not null references public.customers(id) on delete cascade,
  job_id text not null references public.jobs(id) on delete cascade,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'scheduled',
  error_message text,
  review_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id text primary key,
  business_id text not null unique references public.businesses(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null,
  trial_ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_business on public.customers(business_id);
create index if not exists idx_jobs_business on public.jobs(business_id);
create index if not exists idx_jobs_customer on public.jobs(customer_id);
create index if not exists idx_requests_business on public.review_requests(business_id);
create index if not exists idx_requests_due on public.review_requests(status, scheduled_at);
create index if not exists idx_requests_job on public.review_requests(job_id);

alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.review_requests enable row level security;
alter table public.subscriptions enable row level security;
