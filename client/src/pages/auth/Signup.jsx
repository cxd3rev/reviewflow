import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthShell } from "./AuthShell.jsx";
import { PRICE_PER_MONTH } from "../../config/pricing.js";

export default function Signup() {
  const { loginWithPayload } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/api/auth/signup", { method: "POST", body: JSON.stringify(form) });
      await loginWithPayload(data, form);
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle={`7 days free. Then ${PRICE_PER_MONTH}.`}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="alert-error">{error}</p>}
        <div>
          <label className="label">Business name</label>
          <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
        </div>
        <div>
          <label className="label">Your name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
        </div>
        <button className="btn-primary w-full py-2.5" disabled={saving}>
          {saving ? "Creating account…" : "Start free"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-brand-700" to="/login">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
