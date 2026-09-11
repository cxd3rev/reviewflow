export function createSqliteStore(db) {
  return {
    kind: "sqlite",

    async pingTables() {
      return true;
    },

    async getUserById(id) {
      return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    },
    async getUserByEmail(email) {
      return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    },
    async getUserIdByEmailExcept(email, userId) {
      return db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, userId);
    },
    async insertUser(row) {
      db.prepare(
        "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
      ).run(row.id, row.name, row.email, row.password_hash, row.created_at);
    },
    async updateUser(id, patch) {
      const current = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
      const next = { ...current, ...patch };
      db.prepare("UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?").run(
        next.name,
        next.email,
        next.password_hash,
        id
      );
    },

    async getBusinessById(id) {
      return db.prepare("SELECT * FROM businesses WHERE id = ?").get(id);
    },
    async getBusinessByUserId(userId) {
      return db.prepare("SELECT * FROM businesses WHERE user_id = ?").get(userId);
    },
    async insertBusiness(row) {
      db.prepare(
        `INSERT INTO businesses (
          id, user_id, name, type, review_url, review_delay_minutes, automation_enabled,
          sender_name, email_subject, email_message, onboarding_complete, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        row.id,
        row.user_id,
        row.name,
        row.type || null,
        row.review_url || null,
        row.review_delay_minutes,
        row.automation_enabled ? 1 : 0,
        row.sender_name,
        row.email_subject,
        row.email_message,
        row.onboarding_complete ? 1 : 0,
        row.created_at
      );
    },
    async updateBusiness(id, userId, patch) {
      const current = db.prepare("SELECT * FROM businesses WHERE id = ? AND user_id = ?").get(id, userId);
      const next = { ...current, ...patch };
      db.prepare(
        `UPDATE businesses
         SET name = ?, type = ?, review_url = ?, review_delay_minutes = ?, automation_enabled = ?,
             sender_name = ?, email_subject = ?, email_message = ?, onboarding_complete = ?
         WHERE id = ? AND user_id = ?`
      ).run(
        next.name,
        next.type,
        next.review_url,
        next.review_delay_minutes,
        next.automation_enabled ? 1 : 0,
        next.sender_name,
        next.email_subject,
        next.email_message,
        next.onboarding_complete ? 1 : 0,
        id,
        userId
      );
    },

    async getSubscriptionByBusinessId(businessId) {
      return db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(businessId);
    },
    async getSubscriptionByStripeCustomer(stripeCustomerId) {
      return db.prepare("SELECT * FROM subscriptions WHERE stripe_customer_id = ?").get(stripeCustomerId);
    },
    async getSubscriptionByStripeSubscription(stripeSubscriptionId) {
      return db.prepare("SELECT * FROM subscriptions WHERE stripe_subscription_id = ?").get(stripeSubscriptionId);
    },
    async insertSubscription(row) {
      db.prepare(
        `INSERT INTO subscriptions (
          id, business_id, stripe_customer_id, stripe_subscription_id, status, trial_ends_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        row.id,
        row.business_id,
        row.stripe_customer_id || null,
        row.stripe_subscription_id || null,
        row.status,
        row.trial_ends_at,
        row.created_at
      );
    },
    async updateSubscription(businessId, patch) {
      const current = db.prepare("SELECT * FROM subscriptions WHERE business_id = ?").get(businessId);
      const next = { ...current, ...patch };
      db.prepare(
        `UPDATE subscriptions
         SET stripe_customer_id = ?, stripe_subscription_id = ?, status = ?, trial_ends_at = ?
         WHERE business_id = ?`
      ).run(
        next.stripe_customer_id,
        next.stripe_subscription_id,
        next.status,
        next.trial_ends_at,
        businessId
      );
    },

    async listCustomers(businessId) {
      return db.prepare("SELECT * FROM customers WHERE business_id = ? ORDER BY created_at DESC").all(businessId);
    },
    async getCustomer(id, businessId) {
      return db.prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?").get(id, businessId);
    },
    async insertCustomer(row) {
      db.prepare(
        `INSERT INTO customers (id, business_id, first_name, last_name, email, phone, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        row.id,
        row.business_id,
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.notes,
        row.created_at
      );
    },
    async updateCustomer(id, businessId, patch) {
      const current = db.prepare("SELECT * FROM customers WHERE id = ? AND business_id = ?").get(id, businessId);
      const next = { ...current, ...patch };
      db.prepare(
        `UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, notes = ?
         WHERE id = ? AND business_id = ?`
      ).run(next.first_name, next.last_name, next.email, next.phone, next.notes, id, businessId);
    },
    async deleteCustomerCascade(id, businessId) {
      db.prepare("DELETE FROM review_requests WHERE customer_id = ? AND business_id = ?").run(id, businessId);
      db.prepare("DELETE FROM jobs WHERE customer_id = ? AND business_id = ?").run(id, businessId);
      db.prepare("DELETE FROM customers WHERE id = ? AND business_id = ?").run(id, businessId);
    },

    async listJobs(businessId) {
      return db
        .prepare(
          `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
                  customers.email AS customer_email
           FROM jobs JOIN customers ON customers.id = jobs.customer_id
           WHERE jobs.business_id = ? ORDER BY jobs.created_at DESC`
        )
        .all(businessId);
    },
    async getJob(id, businessId) {
      return db.prepare("SELECT * FROM jobs WHERE id = ? AND business_id = ?").get(id, businessId);
    },
    async getJobWithCustomer(id, businessId) {
      return db
        .prepare(
          `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
                  customers.email AS customer_email
           FROM jobs JOIN customers ON customers.id = jobs.customer_id
           WHERE jobs.id = ? AND jobs.business_id = ?`
        )
        .get(id, businessId);
    },
    async insertJob(row) {
      db.prepare(
        `INSERT INTO jobs (id, business_id, customer_id, title, description, completed_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        row.id,
        row.business_id,
        row.customer_id,
        row.title,
        row.description,
        row.completed_at,
        row.status,
        row.created_at
      );
    },
    async updateJob(id, businessId, patch) {
      const current = db.prepare("SELECT * FROM jobs WHERE id = ? AND business_id = ?").get(id, businessId);
      const next = { ...current, ...patch };
      db.prepare(
        `UPDATE jobs SET customer_id = ?, title = ?, description = ?, completed_at = ?, status = ?
         WHERE id = ? AND business_id = ?`
      ).run(
        next.customer_id,
        next.title,
        next.description,
        next.completed_at,
        next.status,
        id,
        businessId
      );
    },
    async deleteJobCascade(id, businessId) {
      db.prepare("DELETE FROM review_requests WHERE job_id = ? AND business_id = ?").run(id, businessId);
      db.prepare("DELETE FROM jobs WHERE id = ? AND business_id = ?").run(id, businessId);
    },

    async listRequests(businessId, status) {
      if (!status || status === "all") {
        return db
          .prepare(
            `SELECT review_requests.*,
                    customers.first_name || ' ' || customers.last_name AS customer_name,
                    jobs.title AS job_title
             FROM review_requests
             JOIN customers ON customers.id = review_requests.customer_id
             JOIN jobs ON jobs.id = review_requests.job_id
             WHERE review_requests.business_id = ?
             ORDER BY review_requests.created_at DESC`
          )
          .all(businessId);
      }
      return db
        .prepare(
          `SELECT review_requests.*,
                  customers.first_name || ' ' || customers.last_name AS customer_name,
                  jobs.title AS job_title
           FROM review_requests
           JOIN customers ON customers.id = review_requests.customer_id
           JOIN jobs ON jobs.id = review_requests.job_id
           WHERE review_requests.business_id = ?
             AND (review_requests.status = ? OR (? = 'scheduled' AND review_requests.status = 'sending'))
           ORDER BY review_requests.created_at DESC`
        )
        .all(businessId, status, status);
    },
    async getRequest(id, businessId) {
      return db
        .prepare(
          `SELECT review_requests.*,
                  customers.first_name || ' ' || customers.last_name AS customer_name,
                  jobs.title AS job_title
           FROM review_requests
           JOIN customers ON customers.id = review_requests.customer_id
           JOIN jobs ON jobs.id = review_requests.job_id
           WHERE review_requests.id = ? AND review_requests.business_id = ?`
        )
        .get(id, businessId);
    },
    async getRequestByJob(jobId, businessId) {
      return db
        .prepare(
          `SELECT id, status FROM review_requests
           WHERE job_id = ? AND business_id = ? AND status IN ('scheduled', 'sent')`
        )
        .get(jobId, businessId);
    },
    async insertRequest(row) {
      db.prepare(
        `INSERT INTO review_requests (
          id, business_id, customer_id, job_id, scheduled_at, sent_at, status, error_message, review_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        row.id,
        row.business_id,
        row.customer_id,
        row.job_id,
        row.scheduled_at,
        row.sent_at || null,
        row.status,
        row.error_message || null,
        row.review_url,
        row.created_at
      );
    },
    async cancelScheduledRequest(id, businessId) {
      db.prepare(
        `UPDATE review_requests SET status = 'cancelled' WHERE id = ? AND business_id = ? AND status = 'scheduled'`
      ).run(id, businessId);
    },
    async cancelUnsentForJob(jobId, businessId) {
      db.prepare(
        `UPDATE review_requests SET status = 'cancelled'
         WHERE job_id = ? AND business_id = ? AND status = 'scheduled'`
      ).run(jobId, businessId);
    },
    async resetSendingRequests() {
      db.prepare(`UPDATE review_requests SET status = 'scheduled' WHERE status = 'sending'`).run();
    },
    async listDueRequests(nowIso) {
      return db
        .prepare(
          `SELECT * FROM review_requests
           WHERE status = 'scheduled' AND scheduled_at <= ?
           ORDER BY scheduled_at ASC LIMIT 25`
        )
        .all(nowIso);
    },
    async claimRequest(id) {
      return db
        .prepare(`UPDATE review_requests SET status = 'sending' WHERE id = ? AND status = 'scheduled'`)
        .run(id);
    },
    async failRequest(id, message) {
      db.prepare(`UPDATE review_requests SET status = 'failed', error_message = ? WHERE id = ?`).run(message, id);
    },
    async cancelRequest(id) {
      db.prepare(`UPDATE review_requests SET status = 'cancelled', error_message = NULL WHERE id = ?`).run(id);
    },
    async markRequestSent(id, sentAt, reviewUrl) {
      db.prepare(
        `UPDATE review_requests
         SET status = 'sent', sent_at = ?, error_message = NULL, review_url = ?
         WHERE id = ? AND status = 'sending'`
      ).run(sentAt, reviewUrl, id);
    },

    async dashboardStats(businessId, monthStartIso) {
      return {
        completedJobs: db
          .prepare("SELECT COUNT(*) AS count FROM jobs WHERE business_id = ? AND status = 'completed'")
          .get(businessId).count,
        requestsSent: db
          .prepare("SELECT COUNT(*) AS count FROM review_requests WHERE business_id = ? AND status = 'sent'")
          .get(businessId).count,
        pending: db
          .prepare("SELECT COUNT(*) AS count FROM review_requests WHERE business_id = ? AND status = 'scheduled'")
          .get(businessId).count,
        thisMonth: db
          .prepare(
            `SELECT COUNT(*) AS count FROM review_requests
             WHERE business_id = ? AND status = 'sent' AND sent_at >= ?`
          )
          .get(businessId, monthStartIso).count,
      };
    },
    async recentJobs(businessId) {
      return db
        .prepare(
          `SELECT jobs.*, customers.first_name || ' ' || customers.last_name AS customer_name,
                  (
                    SELECT review_requests.scheduled_at FROM review_requests
                    WHERE review_requests.job_id = jobs.id
                    ORDER BY review_requests.created_at DESC LIMIT 1
                  ) AS request_scheduled_at,
                  (
                    SELECT review_requests.status FROM review_requests
                    WHERE review_requests.job_id = jobs.id
                    ORDER BY review_requests.created_at DESC LIMIT 1
                  ) AS request_status
           FROM jobs
           JOIN customers ON customers.id = jobs.customer_id
           WHERE jobs.business_id = ?
           ORDER BY COALESCE(jobs.completed_at, jobs.created_at) DESC
           LIMIT 8`
        )
        .all(businessId);
    },
  };
}
