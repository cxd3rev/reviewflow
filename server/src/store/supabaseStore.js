import { createAdminClient } from "@supabase/server/core";

function fail(error) {
  if (error) throw new Error(error.message);
}

function customerName(customer) {
  if (!customer) return null;
  return [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim() || null;
}

function withJobCustomer(job, customer) {
  if (!job) return null;
  return {
    ...job,
    customer_name: customerName(customer),
    customer_email: customer?.email || null,
  };
}

function withRequestJoins(request, customer, job) {
  if (!request) return null;
  return {
    ...request,
    customer_name: customerName(customer),
    job_title: job?.title || null,
  };
}

export function createSupabaseStore() {
  const sb = /** @type {any} */ (createAdminClient());

  async function one(query) {
    const { data, error } = await query.maybeSingle();
    fail(error);
    return data || null;
  }

  async function many(query) {
    const { data, error } = await query;
    fail(error);
    return data || [];
  }

  async function countEq(table, filters) {
    let q = sb.from(table).select("id", { count: "exact", head: true });
    for (const [key, value] of Object.entries(filters)) {
      q = q.eq(key, value);
    }
    const { count, error } = await q;
    fail(error);
    return count || 0;
  }

  return {
    kind: "supabase",

    async pingTables() {
      const { error } = await sb.from("users").select("id").limit(1);
      return !error;
    },

    async getUserById(id) {
      return one(sb.from("users").select("*").eq("id", id));
    },
    async getUserByEmail(email) {
      return one(sb.from("users").select("*").eq("email", email));
    },
    async getUserIdByEmailExcept(email, userId) {
      return one(sb.from("users").select("id").eq("email", email).neq("id", userId));
    },
    async insertUser(row) {
      fail((await sb.from("users").insert(row)).error);
    },
    async updateUser(id, patch) {
      fail((await sb.from("users").update(patch).eq("id", id)).error);
    },

    async getBusinessById(id) {
      return one(sb.from("businesses").select("*").eq("id", id));
    },
    async getBusinessByUserId(userId) {
      return one(sb.from("businesses").select("*").eq("user_id", userId));
    },
    async insertBusiness(row) {
      fail((await sb.from("businesses").insert(row)).error);
    },
    async updateBusiness(id, userId, patch) {
      fail((await sb.from("businesses").update(patch).eq("id", id).eq("user_id", userId)).error);
    },

    async getSubscriptionByBusinessId(businessId) {
      return one(sb.from("subscriptions").select("*").eq("business_id", businessId));
    },
    async getSubscriptionByStripeCustomer(stripeCustomerId) {
      return one(sb.from("subscriptions").select("*").eq("stripe_customer_id", stripeCustomerId));
    },
    async getSubscriptionByStripeSubscription(stripeSubscriptionId) {
      return one(sb.from("subscriptions").select("*").eq("stripe_subscription_id", stripeSubscriptionId));
    },
    async insertSubscription(row) {
      fail((await sb.from("subscriptions").insert(row)).error);
    },
    async updateSubscription(businessId, patch) {
      fail((await sb.from("subscriptions").update(patch).eq("business_id", businessId)).error);
    },

    async listCustomers(businessId) {
      return many(sb.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false }));
    },
    async getCustomer(id, businessId) {
      return one(sb.from("customers").select("*").eq("id", id).eq("business_id", businessId));
    },
    async insertCustomer(row) {
      fail((await sb.from("customers").insert(row)).error);
    },
    async updateCustomer(id, businessId, patch) {
      fail((await sb.from("customers").update(patch).eq("id", id).eq("business_id", businessId)).error);
    },
    async deleteCustomerCascade(id, businessId) {
      fail((await sb.from("review_requests").delete().eq("customer_id", id).eq("business_id", businessId)).error);
      fail((await sb.from("jobs").delete().eq("customer_id", id).eq("business_id", businessId)).error);
      fail((await sb.from("customers").delete().eq("id", id).eq("business_id", businessId)).error);
    },

    async listJobs(businessId) {
      const jobs = await many(
        sb.from("jobs").select("*").eq("business_id", businessId).order("created_at", { ascending: false })
      );
      const customers = await many(sb.from("customers").select("*").eq("business_id", businessId));
      const byId = Object.fromEntries(customers.map((c) => [c.id, c]));
      return jobs.map((job) => withJobCustomer(job, byId[job.customer_id]));
    },
    async getJob(id, businessId) {
      return one(sb.from("jobs").select("*").eq("id", id).eq("business_id", businessId));
    },
    async getJobWithCustomer(id, businessId) {
      const job = await one(sb.from("jobs").select("*").eq("id", id).eq("business_id", businessId));
      if (!job) return null;
      const customer = await one(sb.from("customers").select("*").eq("id", job.customer_id));
      return withJobCustomer(job, customer);
    },
    async insertJob(row) {
      fail((await sb.from("jobs").insert(row)).error);
    },
    async updateJob(id, businessId, patch) {
      fail((await sb.from("jobs").update(patch).eq("id", id).eq("business_id", businessId)).error);
    },
    async deleteJobCascade(id, businessId) {
      fail((await sb.from("review_requests").delete().eq("job_id", id).eq("business_id", businessId)).error);
      fail((await sb.from("jobs").delete().eq("id", id).eq("business_id", businessId)).error);
    },

    async listRequests(businessId, status) {
      let q = sb.from("review_requests").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
      if (status && status !== "all") {
        if (status === "scheduled") q = q.in("status", ["scheduled", "sending"]);
        else q = q.eq("status", status);
      }
      const requests = await many(q);
      const customers = await many(sb.from("customers").select("*").eq("business_id", businessId));
      const jobs = await many(sb.from("jobs").select("id, title").eq("business_id", businessId));
      const customersById = Object.fromEntries(customers.map((c) => [c.id, c]));
      const jobsById = Object.fromEntries(jobs.map((j) => [j.id, j]));
      return requests.map((row) => withRequestJoins(row, customersById[row.customer_id], jobsById[row.job_id]));
    },
    async getRequest(id, businessId) {
      const row = await one(sb.from("review_requests").select("*").eq("id", id).eq("business_id", businessId));
      if (!row) return null;
      const customer = await one(sb.from("customers").select("*").eq("id", row.customer_id));
      const job = await one(sb.from("jobs").select("id, title").eq("id", row.job_id));
      return withRequestJoins(row, customer, job);
    },
    async getRequestByJob(jobId, businessId) {
      const { data, error } = await sb
        .from("review_requests")
        .select("id, status")
        .eq("job_id", jobId)
        .eq("business_id", businessId)
        .in("status", ["scheduled", "sent"])
        .limit(1)
        .maybeSingle();
      fail(error);
      return data || null;
    },
    async insertRequest(row) {
      fail((await sb.from("review_requests").insert(row)).error);
    },
    async cancelScheduledRequest(id, businessId) {
      fail(
        (
          await sb
            .from("review_requests")
            .update({ status: "cancelled" })
            .eq("id", id)
            .eq("business_id", businessId)
            .eq("status", "scheduled")
        ).error
      );
    },
    async cancelUnsentForJob(jobId, businessId) {
      fail(
        (
          await sb
            .from("review_requests")
            .update({ status: "cancelled" })
            .eq("job_id", jobId)
            .eq("business_id", businessId)
            .eq("status", "scheduled")
        ).error
      );
    },
    async resetSendingRequests() {
      fail((await sb.from("review_requests").update({ status: "scheduled" }).eq("status", "sending")).error);
    },
    async listDueRequests(nowIso) {
      return many(
        sb
          .from("review_requests")
          .select("*")
          .eq("status", "scheduled")
          .lte("scheduled_at", nowIso)
          .order("scheduled_at", { ascending: true })
          .limit(25)
      );
    },
    async claimRequest(id) {
      const { data, error } = await sb
        .from("review_requests")
        .update({ status: "sending" })
        .eq("id", id)
        .eq("status", "scheduled")
        .select("id");
      fail(error);
      return { changes: data?.length || 0 };
    },
    async failRequest(id, message) {
      fail((await sb.from("review_requests").update({ status: "failed", error_message: message }).eq("id", id)).error);
    },
    async cancelRequest(id) {
      fail((await sb.from("review_requests").update({ status: "cancelled", error_message: null }).eq("id", id)).error);
    },
    async markRequestSent(id, sentAt, reviewUrl) {
      fail(
        (
          await sb
            .from("review_requests")
            .update({ status: "sent", sent_at: sentAt, error_message: null, review_url: reviewUrl })
            .eq("id", id)
            .eq("status", "sending")
        ).error
      );
    },

    async dashboardStats(businessId, monthStartIso) {
      const completedJobs = await countEq("jobs", { business_id: businessId, status: "completed" });
      const requestsSent = await countEq("review_requests", { business_id: businessId, status: "sent" });
      const pending = await countEq("review_requests", { business_id: businessId, status: "scheduled" });
      const { count, error } = await sb
        .from("review_requests")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "sent")
        .gte("sent_at", monthStartIso);
      fail(error);
      return { completedJobs, requestsSent, pending, thisMonth: count || 0 };
    },
    async recentJobs(businessId) {
      const jobs = await many(
        sb.from("jobs").select("*").eq("business_id", businessId).order("created_at", { ascending: false }).limit(16)
      );
      jobs.sort((a, b) => String(b.completed_at || b.created_at).localeCompare(String(a.completed_at || a.created_at)));
      const slice = jobs.slice(0, 8);
      const customers = await many(sb.from("customers").select("*").eq("business_id", businessId));
      const requests = await many(
        sb.from("review_requests").select("*").eq("business_id", businessId).order("created_at", { ascending: false })
      );
      const customersById = Object.fromEntries(customers.map((c) => [c.id, c]));
      return slice.map((job) => {
        const latest = requests.find((r) => r.job_id === job.id);
        return {
          ...withJobCustomer(job, customersById[job.customer_id]),
          request_scheduled_at: latest?.scheduled_at || null,
          request_status: latest?.status || null,
        };
      });
    },
  };
}
