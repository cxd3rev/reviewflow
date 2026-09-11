# ReviewFlow

Automatically request reviews after completed jobs.

ReviewFlow is a small SaaS for local service businesses — painters, plumbers, cleaners, and similar trades. After a job is marked completed, it schedules an email asking the customer to leave a review and sends them to the business’s Google (or other) review page.

Price: **€29,99/month**, with a **7-day free trial**.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** SQLite via Node’s built-in `node:sqlite`
- **Auth:** Email + password (bcrypt), JWT
- **Email:** Resend (or console logging in development)
- **Payments:** Stripe Checkout + Customer Portal + webhooks
- **Scheduler:** In-process interval that sends due review requests

No extra services, queues, or microservices. One API process and a static frontend.

## Project structure

```
/client
  /src/pages/landing    Marketing homepage (split by section)
  /src/pages/auth       Login, signup, onboarding
  /src/pages/app        Dashboard, customers, jobs, requests, settings, billing
  /src/components       Layout and UI pieces
  /src/config           Price and other constants
  /src/context          Auth state
  /src/lib              API helper
/server
  /src/routes           HTTP routes
  /src/middleware       Auth and trial/subscription checks
  /src/services         Email, scheduler, Stripe, review requests
  /src/utils            Validation and email templates
  /src/db               SQL schema
  /database             SQLite file (created at runtime)
.env.example            Environment variable template
```

Do **not** upload `node_modules`. That folder is huge and GitHub does not need it. After someone clones the repo they run `npm install` and it is created again.

`client` and `server` look too big only because they contain `node_modules`. The real source is tiny (about 50 files).

### Upload with the GitHub website

1. In this project run:

```bash
npm run pack:github
```

That creates an `upload` folder with **only source files** (no `node_modules`).

2. On GitHub, open `upload` on your computer and add these small folders one at a time:

- `upload/client`
- `upload/server`
- `upload/scripts`

Then add the files next to them: `package.json`, `package-lock.json`, `README.md`, `.gitignore`, `.env.example`.

`node_modules` cannot be split into smaller files. It is thousands of third-party packages. GitHub will reject it, and the app does not need it on GitHub. After you (or anyone else) download the repo, run `npm install` once — that rebuilds `node_modules` on the computer.

Do **not** drag the original `client`, `server`, or `node_modules` folders — those still contain the huge install files on your PC.

3. Keep working in this project as usual (`npm run dev`). Use `npm run pack:github` again whenever you want a fresh copy to upload.

## GitHub Pages (the website URL)

GitHub Pages can only host **static files**. That is why you saw a 404: the repo had no `index.html` at the site root. The login/API part still needs a computer running `npm run dev` (or another host). Pages can show the ReviewFlow website UI.

1. On your computer run:

```bash
npm run build:pages
npm run pack:github
```

2. Upload these onto GitHub (from the `upload` folder):

- `index.html` (this file must sit at the **root** of the repo)
- the `docs` folder
- `.github` if you want automatic rebuilds

3. In the GitHub repo open **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: `main` (or `master`)
- Folder: **/docs**

Save, wait a minute, then open the Pages URL again.

If Pages is still set to **/ (root)**, the root `index.html` will send visitors to `/docs/`.

Login and review emails will not work on GitHub Pages, because there is no Node server there. Use `npm run dev` on your computer for the full app.

## How to install

You need Node.js 22+ (Node 24 is fine).

```bash
copy .env.example .env
npm install
```

Set `JWT_SECRET` in `.env` to a long random string before running.

## How to run locally

```bash
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3001

Optional demo data (development only):

```bash
npm run seed
```

Demo login:

- Email: `aron@reviewflow.test`
- Password: `Demo1234!`

## Environment variables

See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Path to the SQLite file |
| `JWT_SECRET` | Signs login tokens |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhooks |
| `STRIPE_PRICE_ID` | Recurring €29,99/month price |
| `EMAIL_API_KEY` | Resend API key |
| `EMAIL_FROM` | From address (must be verified in Resend) |
| `EMAIL_LOG_ONLY` | If `true`, print emails to the server console instead of sending |
| `DEMO_MODE` | Unused by the server at runtime; seed script is the demo path |
| `CLIENT_ORIGIN` | Frontend origin for CORS and Stripe return URLs |

## How to configure Stripe

1. Create a Stripe account and a Product named **ReviewFlow Pro**.
2. Add a recurring price of **€29,99 / month**.
3. Copy the price id into `STRIPE_PRICE_ID`.
4. Put your secret key in `STRIPE_SECRET_KEY`.
5. Forward webhooks to `POST /api/billing/webhook` (local: [Stripe CLI](https://stripe.com/docs/stripe-cli) `stripe listen --forward-to localhost:3001/api/billing/webhook`).
6. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
7. Listen for at least: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
8. Enable the Customer Portal in the Stripe Dashboard so users can cancel.

Until Stripe is configured, new accounts still get a 7-day trial and can use the product.

## How to configure email

1. Create a [Resend](https://resend.com) account and verify a sending domain.
2. Set `EMAIL_API_KEY` and `EMAIL_FROM`.
3. Set `EMAIL_LOG_ONLY=false`.

For local testing without Resend, keep `EMAIL_LOG_ONLY=true`. The scheduler still marks requests as **Sent**, and the email (including the review URL) is printed in the server terminal.

## How the scheduler works

Every 15 seconds the API looks for `review_requests` rows where:

- `status = scheduled`
- `scheduled_at` is in the past

It claims each row (so a restart cannot send twice), loads the customer and business, builds the email template, sends it, then sets `status = sent` and `sent_at`. If sending fails, it sets `status = failed` and stores `error_message` without crashing.

It will not send if:

- the customer has no valid email
- the job was cancelled
- the trial/subscription is no longer active
- the request was already sent or cancelled

Delay is configured in Settings (`Immediately` / 1 hour / 24 / 48 / 72 hours). Use **Immediately** (0 minutes) when testing.

## Production build

```bash
npm run build
set NODE_ENV=production
npm start
```

In production the Express server serves `client/dist` so you can host a single Node process.

## How to deploy

A cheap single-service host (Render, Railway, a small VPS) is enough.

1. Set all production environment variables, including a strong `JWT_SECRET`.
2. Point `DATABASE_URL` at a persistent disk path so SQLite survives restarts.
3. Set `CLIENT_ORIGIN` to your public URL.
4. Set `EMAIL_LOG_ONLY=false` and configure Resend.
5. Point Stripe webhooks at `https://your-domain/api/billing/webhook`.
6. Build the client, then start the server with `NODE_ENV=production`.

SQLite is fine for an early MVP. Move to Postgres later if you outgrow a single disk.

## Test the core flow

1. Create an account.
2. Set a Google review URL (onboarding or Settings).
3. Add a customer with an email.
4. Create a job.
5. Set delay to **Immediately** in Settings.
6. Mark the job **Completed** and choose **Send automatically**.
7. Wait a few seconds for the scheduler.
8. Confirm the request moves from Scheduled to Sent.
9. Open the logged/sent email and click **Leave a Review** — it should open your review URL.
