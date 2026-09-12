import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";

const empty = { firstName: "", lastName: "", email: "", phone: "", notes: "" };

export default function Customers() {
  const { t } = useI18n();
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
    if (!confirm(t("customers.confirmDelete", { name: `${customer.firstName} ${customer.lastName}` }))) return;
    await api(`/api/customers/${customer.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title={t("customers.title")}
        description={t("customers.desc")}
        action={
          <button className="btn-primary" onClick={openNew}>
            {t("customers.add")}
          </button>
        }
      />

      {error && !editing && <p className="alert-error mb-4">{error}</p>}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("common.name")}</th>
              <th>{t("common.email")}</th>
              <th>{t("common.phone")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td className="text-muted" colSpan={4}>
                  {t("customers.empty")}
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="font-medium text-ink">
                  {customer.firstName} {customer.lastName}
                </td>
                <td>
                  {customer.email || <span className="text-zinc-500">{t("customers.noEmail")}</span>}
                </td>
                <td className="text-muted">{customer.phone || "—"}</td>
                <td className="text-right whitespace-nowrap">
                  <button className="link mr-3" onClick={() => setViewing(customer)}>
                    {t("common.view")}
                  </button>
                  <button className="link mr-3" onClick={() => openEdit(customer)}>
                    {t("common.edit")}
                  </button>
                  <button className="text-sm font-medium text-red-400 hover:text-red-300" onClick={() => remove(customer)}>
                    {t("common.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === "new" ? t("customers.add") : t("customers.edit")} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-3">
            {error && <p className="alert-error">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t("customers.firstName")}</label>
                <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div>
                <label className="label">{t("customers.lastName")}</label>
                <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">{t("common.email")}</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">{t("common.phone")}</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">{t("common.notes")}</label>
              <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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

      {viewing && (
        <Modal title={`${viewing.firstName} ${viewing.lastName}`} onClose={() => setViewing(null)}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">{t("common.email")}</dt>
              <dd className="mt-0.5">{viewing.email || t("customers.noEmailDetail")}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("common.phone")}</dt>
              <dd className="mt-0.5">{viewing.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("common.notes")}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap">{viewing.notes || "—"}</dd>
            </div>
          </dl>
        </Modal>
      )}
    </div>
  );
}
