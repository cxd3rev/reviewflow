import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { formatDate } from "../../utils/format.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

const empty = { customerId: "", title: "", description: "", status: "scheduled" };

export default function Jobs() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const [jobData, customerData] = await Promise.all([api("/api/jobs"), api("/api/customers")]);
    setJobs(jobData.jobs);
    setCustomers(customerData.customers);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function openNew() {
    setForm({ ...empty, customerId: customers[0]?.id || "" });
    setEditing("new");
    setError("");
  }

  function openEdit(job) {
    setForm({
      customerId: job.customerId,
      title: job.title,
      description: job.description || "",
      status: job.status,
    });
    setEditing(job);
    setError("");
  }

  async function persist(payload) {
    if (editing === "new") {
      return api("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
    }
    return api(`/api/jobs/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
  }

  async function save(event) {
    event.preventDefault();
    const goingComplete = form.status === "completed" && (editing === "new" || editing.status !== "completed");
    if (goingComplete) {
      setConfirmComplete(form);
      return;
    }
    await submit(form);
  }

  async function submit(payload) {
    try {
      const result = await persist(payload);
      setEditing(null);
      setConfirmComplete(null);
      if (result.reviewRequest?.error) setNotice(result.reviewRequest.error);
      else if (result.reviewRequest?.ok) setNotice(t("jobs.scheduled"));
      else setNotice("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("jobs.title")}
        description={t("jobs.desc")}
        action={
          <button className="btn-primary" onClick={openNew} disabled={customers.length === 0}>
            {t("jobs.add")}
          </button>
        }
      />

      {customers.length === 0 && (
        <p className="alert-warn mb-4">
          {t("jobs.needCustomer")} <Link className="font-medium underline" to="/app/customers">{t("jobs.goCustomers")}</Link>
        </p>
      )}
      {notice && <p className="alert-ok mb-4">{notice}</p>}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.customer")}</th>
              <th>{t("common.job")}</th>
              <th>{t("jobs.completed")}</th>
              <th>{t("common.status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td className="text-muted" colSpan={5}>
                  {t("jobs.empty")}
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="font-medium text-ink">{job.customerName}</td>
                <td>
                  <div>{job.title}</div>
                  {job.description && <div className="text-muted">{job.description}</div>}
                </td>
                <td className="text-muted">{formatDate(job.completedAt)}</td>
                <td>
                  <StatusBadge status={job.status} kind="job" />
                </td>
                <td className="text-right">
                  <button className="link" onClick={() => openEdit(job)}>
                    {t("common.edit")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === "new" ? t("jobs.add") : t("jobs.edit")} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="alert-error">{error}</p>}
            <div>
              <label className="label">{t("common.customer")}</label>
              <select className="input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                    {!customer.email ? " (no email)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t("jobs.jobName")}</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">{t("jobs.description")}</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">{t("common.status")}</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">{t("status.jobScheduled")}</option>
                <option value="in_progress">{t("status.jobProgress")}</option>
                <option value="completed">{t("status.jobCompleted")}</option>
                <option value="cancelled">{t("status.jobCancelled")}</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                {t("common.cancel")}
              </button>
              <button className="btn-primary">{t("common.save")}</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmComplete && (
        <Modal title={t("jobs.sendTitle")} onClose={() => setConfirmComplete(null)}>
          <p className="text-sm text-muted">{t("jobs.sendHelp")}</p>
          <div className="mt-5 flex flex-col gap-2">
            <button className="btn-primary" onClick={() => submit({ ...confirmComplete, sendAutomatically: true })}>
              {t("jobs.sendYes")}
            </button>
            <button className="btn-secondary" onClick={() => submit({ ...confirmComplete, sendAutomatically: false })}>
              {t("jobs.sendNo")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
