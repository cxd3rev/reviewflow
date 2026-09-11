import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { formatDate } from "../../utils/format.js";

const empty = { customerId: "", title: "", description: "", status: "scheduled" };

export default function Jobs() {
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
      else if (result.reviewRequest?.ok) setNotice("Review request scheduled.");
      else setNotice("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="When you mark a job completed, starywrld can email a review request."
        action={
          <button className="btn-primary" onClick={openNew} disabled={customers.length === 0}>
            Add job
          </button>
        }
      />

      {customers.length === 0 && (
        <p className="alert-warn mb-4">
          Add a customer first. <Link className="font-medium underline" to="/app/customers">Go to customers</Link>
        </p>
      )}
      {notice && <p className="alert-ok mb-4">{notice}</p>}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Job</th>
              <th>Completed</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td className="text-muted" colSpan={5}>
                  No jobs yet.
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
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Add job" : "Edit job"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="alert-error">{error}</p>}
            <div>
              <label className="label">Customer</label>
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
              <label className="label">Job name</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {confirmComplete && (
        <Modal title="Send a review request?" onClose={() => setConfirmComplete(null)}>
          <p className="text-sm text-muted">We’ll email this customer using your delay setting in Settings.</p>
          <div className="mt-5 flex flex-col gap-2">
            <button className="btn-primary" onClick={() => submit({ ...confirmComplete, sendAutomatically: true })}>
              Yes, send automatically
            </button>
            <button className="btn-secondary" onClick={() => submit({ ...confirmComplete, sendAutomatically: false })}>
              Complete job without sending
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
