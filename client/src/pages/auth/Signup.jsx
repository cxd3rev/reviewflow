import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { AuthShell } from "./AuthShell.jsx";
import { localizedPrice } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export default function Signup() {
  const { loginWithPayload } = useAuth();
  const { t } = useI18n();
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
    <AuthShell title={t("auth.signupTitle")} subtitle={t("auth.signupSub", { price: localizedPrice(t) })}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <p className="alert-error">{error}</p>}
        <div>
          <label className="label">{t("auth.businessName")}</label>
          <input className="input" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
        </div>
        <div>
          <label className="label">{t("auth.yourName")}</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="label">{t("common.email")}</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">{t("common.password")}</label>
          <input className="input" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <p className="mt-1 text-xs text-muted">{t("auth.minChars")}</p>
        </div>
        <button className="btn-primary w-full py-2.5" disabled={saving}>
          {saving ? t("auth.creating") : t("common.signup")}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {t("auth.haveAccount")}{" "}
        <Link className="font-medium text-white" to="/login">
          {t("common.logIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
