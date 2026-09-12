import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { pingSupabase } from "../../lib/supabase.js";
import { deleteExampleRow, insertExampleRow, listExampleRows } from "../../lib/example.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { applyTemplate, delayLabel } from "../../utils/format.js";

const DELAYS = [0, 60, 1440, 2880, 4320];
const TYPES = ["Plumber", "Electrician", "Cleaner", "Painter", "Mechanic", "Contractor", "Landscaper", "Barber", "Beauty", "Handyman", "Other"];

export default function Settings() {
  const { user, business, entitlement, supabaseUser, supabaseAuthError, setBusiness, refresh } = useAuth();
  const [biz, setBiz] = useState({
    name: business?.name || "",
    type: business?.type || "",
    reviewUrl: business?.reviewUrl || "",
    reviewDelayMinutes: business?.reviewDelayMinutes ?? 1440,
    automationEnabled: business?.automationEnabled ?? true,
    senderName: business?.senderName || business?.name || "",
    emailSubject: business?.emailSubject || "",
    emailMessage: business?.emailMessage || "",
  });
  const [account, setAccount] = useState({ name: user?.name || "", email: user?.email || "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [supabaseStatus, setSupabaseStatus] = useState("Checking Supabase…");
  const [exampleRows, setExampleRows] = useState([]);
  const [exampleSaving, setExampleSaving] = useState(false);

  useEffect(() => {
    pingSupabase().then((result) => {
      if (!result.configured) {
        setSupabaseStatus("Supabase browser client is not configured.");
        return;
      }
      if (!result.ok) {
        setSupabaseStatus(`Supabase error: ${result.error}`);
        return;
      }
      setSupabaseStatus("Supabase browser client is connected (project chfjwzdcgzfswtqyqveu).");
    });
  }, []);

  useEffect(() => {
    if (!supabaseUser) {
      setExampleRows([]);
      return;
    }
    listExampleRows()
      .then(setExampleRows)
      .catch((err) => setError(err.message));
  }, [supabaseUser]);

  const preview = applyTemplate(biz.emailMessage, {
    customer_name: "Jane Customer",
    business_name: biz.senderName || biz.name || "Your business",
  });

  async function saveBusiness(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await api("/api/business", { method: "PUT", body: JSON.stringify(biz) });
      setBusiness(data.business);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveAccount(event) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/auth/account", { method: "PUT", body: JSON.stringify(account) });
      await refresh();
      setAccount({ ...account, password: "" });
      setMessage("Account updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function addExampleRow() {
    setError("");
    setExampleSaving(true);
    try {
      await insertExampleRow();
      setExampleRows(await listExampleRows());
      setMessage("Example row saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setExampleSaving(false);
    }
  }

  async function removeExampleRow(id) {
    setError("");
    try {
      await deleteExampleRow(id);
      setExampleRows(await listExampleRows());
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Your business, review link, and the email customers receive." />
      <p className="mb-4 text-sm text-muted">{supabaseStatus}</p>
      {message && <p className="alert-ok mb-4">{message}</p>}
      {error && <p className="alert-error mb-4">{error}</p>}

      <div className="card mb-4 space-y-3 p-6">
        <div>
          <h2 className="section-title">Example rows</h2>
          <p className="section-help">Stored in Supabase as your user. Other accounts cannot see these rows.</p>
        </div>
        <p className="text-sm text-muted">
          {supabaseUser
            ? `Signed in to Supabase as ${supabaseUser.email || supabaseUser.id}.`
            : supabaseAuthError || "Not signed in to Supabase. Log out and log in again to create a session."}
        </p>
        <button className="btn-primary" type="button" disabled={exampleSaving} onClick={addExampleRow}>
          {exampleSaving ? "Saving…" : "Add example row"}
        </button>
        {exampleRows.length === 0 ? (
          <p className="text-sm text-muted">No rows yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {exampleRows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 rounded-xl border border-edge px-3 py-2">
                <span className="truncate text-muted">{row.id}</span>
                <button className="text-sm text-muted hover:text-ink" type="button" onClick={() => removeExampleRow(row.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="card mb-4 space-y-4 p-6" onSubmit={saveBusiness}>
        <div>
          <h2 className="section-title">Business</h2>
          <p className="section-help">Shown in emails and on your account.</p>
        </div>
        <div>
          <label className="label">Business name</label>
          <input className="input" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Type of work</label>
          <select className="input" value={biz.type} onChange={(e) => setBiz({ ...biz, type: e.target.value })}>
            <option value="">Select type</option>
            {TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Save</button>
      </form>

      <form className="card mb-4 space-y-4 p-6" onSubmit={saveBusiness}>
        <div>
          <h2 className="section-title">When to ask for a review</h2>
          <p className="section-help">The review URL is where the email button sends the customer.</p>
        </div>
        <div>
          <label className="label">Review page URL</label>
          <input className="input" value={biz.reviewUrl} onChange={(e) => setBiz({ ...biz, reviewUrl: e.target.value })} placeholder="https://g.page/r/…" />
        </div>
        <div>
          <label className="label">Wait after the job is completed</label>
          <select
            className="input"
            value={biz.reviewDelayMinutes}
            onChange={(e) => setBiz({ ...biz, reviewDelayMinutes: Number(e.target.value) })}
          >
            {DELAYS.map((delay) => (
              <option key={delay} value={delay}>
                {delayLabel(delay)}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={biz.automationEnabled}
            onChange={(e) => setBiz({ ...biz, automationEnabled: e.target.checked })}
          />
          Send review emails automatically
        </label>
        <button className="btn-primary">Save</button>
      </form>

      <form className="card mb-4 space-y-4 p-6" onSubmit={saveBusiness}>
        <div>
          <h2 className="section-title">Email</h2>
          <p className="section-help">Use {"{{customer_name}}"} and {"{{business_name}}"} — they fill in automatically.</p>
        </div>
        <div>
          <label className="label">Sender name</label>
          <input className="input" value={biz.senderName} onChange={(e) => setBiz({ ...biz, senderName: e.target.value })} />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={biz.emailSubject} onChange={(e) => setBiz({ ...biz, emailSubject: e.target.value })} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={7} value={biz.emailMessage} onChange={(e) => setBiz({ ...biz, emailMessage: e.target.value })} />
        </div>
        <div className="rounded-xl border border-edge bg-paper p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Preview</div>
          <div className="mt-2 text-sm font-semibold">{biz.emailSubject}</div>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{preview}</pre>
          <div className="mt-3 inline-flex rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-white">Leave a Review</div>
        </div>
        <button className="btn-primary">Save</button>
      </form>

      <form className="card mb-4 space-y-4 p-6" onSubmit={saveAccount}>
        <h2 className="section-title">Your login</h2>
        <div>
          <label className="label">Name</label>
          <input className="input" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
        </div>
        <div>
          <label className="label">New password</label>
          <input className="input" type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} placeholder="Leave blank to keep the current one" />
        </div>
        <button className="btn-primary">Save</button>
      </form>

      <div className="card space-y-2 p-6">
        <h2 className="section-title">Plan</h2>
        <p className="text-sm text-muted">
          {entitlement?.plan === "pro" ? "starywrld Pro" : entitlement?.trialActive ? "Free trial" : "Inactive"} · {entitlement?.status}
        </p>
        <Link className="link inline-block pt-1" to="/app/billing">
          Manage billing
        </Link>
      </div>
    </div>
  );
}
