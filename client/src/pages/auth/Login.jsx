import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthShell } from "./AuthShell.jsx";

export default function Login() {
  const { loginWithPayload } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(form) });
      await loginWithPayload(data, form);
      navigate(data.business?.onboardingComplete ? "/app" : "/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthShell title="Log in" subtitle="Use your work email to open your dashboard.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="alert-error">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn-primary w-full py-2.5" disabled={saving}>
          {saving ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        New here?{" "}
        <Link className="font-medium text-brand-700" to="/signup">
          Start free
        </Link>
      </p>
    </AuthShell>
  );
}

