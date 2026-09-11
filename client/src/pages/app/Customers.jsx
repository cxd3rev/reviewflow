import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";

const empty = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);

  async function load() {
    const data = await api("/api/customers");
    setCustomers(data.customers);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function openNew() {
    setForm(empty);
    setEditing("new");
    setError("");
  }

  function openEdit(customer) {
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || "",
      phone: customer.phone || "",
      notes: customer.notes || "",
    });
    setEditing(customer);
    setError("");
  }

  async function save(event) {
    event.preventDefault();
    try {
      if (editing === "new") {
        await api("/api/customers", { method: "POST", body: JSON.stringify(form) });
      } else {
        await api(`/api/customers/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(customer) {
    if (!confirm(`Delete ${customer.firstName} ${customer.lastName}? This also deletes their jobs.`)) return;
    await api(`/api/customers/${customer.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Add an email so starywrld can ask them for a review after a job."
        action={
          <button className="btn-primary" onClick={openNew}>
            Add customer
          </button>
        }
      />

      {error && !editing && <p className="alert-error mb-4">{error}</p>}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td className="text-muted" colSpan={4}>
                  No customers yet. Add one to start creating jobs.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="font-medium text-ink">
                  {customer.firstName} {customer.lastName}
                </td>
                <td>
                  {customer.email || <span className="text-slate-400">No email — can’t send a request</span>}
                </td>
                <td className="text-muted">{customer.phone || "—"}</td>
                <td className="text-right whitespace-nowrap">
                  <button className="link mr-3" onClick={() => setViewing(customer)}>
                    View
                  </button>
                  <button className="link mr-3" onClick={() => openEdit(customer)}>
                    Edit
                  </button>
                  <button className="text-sm font-medium text-red-700 hover:text-red-800" onClick={() => remove(customer)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === "new" ? "Add customer" : "Edit customer"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="alert-error">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First name</label>
                <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

      {viewing && (
        <Modal title={`${viewing.firstName} ${viewing.lastName}`} onClose={() => setViewing(null)}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-0.5">{viewing.email || "This customer doesn't have an email address."}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-0.5">{viewing.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Notes</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">{viewing.notes || "—"}</dd>
            </div>
          </dl>
        </Modal>
      )}
    </div>
  );
}
