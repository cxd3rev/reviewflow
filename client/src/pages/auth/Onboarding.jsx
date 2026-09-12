import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Logo } from "../../components/ui/Logo.jsx";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";

const TYPES = ["Plumber", "Electrician", "Cleaner", "Painter", "Mechanic", "Contractor", "Landscaper", "Barber", "Beauty", "Handyman", "Other"];
export default function Onboarding() {
  const { t } = useI18n();
  const { business, setBusiness, refresh } = useAuth();
  const DELAYS = [
    { value: 0, label: t("onboard.immediately") },
    { value: 60, label: t("onboard.hour1") },
    { value: 1440, label: t("onboard.hours24") },
    { value: 2880, label: t("onboard.hours48") },
    { value: 4320, label: t("onboard.hours72") },
  ];
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: business?.name || "",
    type: "",
    reviewUrl: "",
    reviewDelayMinutes: 1440,
  });

  async function finish() {
    setError("");
    try {
      const data = await api("/api/business/onboarding", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setBusiness(data.business);
      await refresh();
      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo to="/" variant="wordmark" />
          <LanguageSwitcher />
        </div>
        <div className="mb-4 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-white" : "bg-white/10"}`} />
          ))}
        </div>
        <p className="mb-3 text-sm text-muted">{t("onboard.step", { n: step })}</p>
        <div className="card p-7">
          {error && <p className="alert-error mb-4">{error}</p>}

          {step === 1 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">{t("onboard.nameTitle")}</h1>
              <p className="mt-1 text-sm text-muted">{t("onboard.nameHelp")}</p>
              <input className="input mt-5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <button className="btn-primary mt-5" disabled={!form.name.trim()} onClick={() => setStep(2)}>
                {t("common.continue")}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">{t("onboard.typeTitle")}</h1>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition ${form.type === type ? "border-white/30 bg-white/10 font-medium text-white" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                    onClick={() => setForm({ ...form, type })}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(1)}>{t("common.back")}</button>
                <button className="btn-primary" disabled={!form.type} onClick={() => setStep(3)}>{t("common.continue")}</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">{t("onboard.urlTitle")}</h1>
              <p className="mt-1 text-sm text-muted">{t("onboard.urlHelp")}</p>
              <input
                className="input mt-5"
                placeholder="https://g.page/r/your-business/review"
                value={form.reviewUrl}
                onChange={(e) => setForm({ ...form, reviewUrl: e.target.value })}
              />
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(2)}>{t("common.back")}</button>
                <button className="btn-primary" onClick={() => setStep(4)}>{t("common.continue")}</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">{t("onboard.delayTitle")}</h1>
              <p className="mt-1 text-sm text-muted">{t("onboard.delayHelp")}</p>
              <div className="mt-5 space-y-2">
                {DELAYS.map((delay) => (
                  <label key={delay.value} className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm has-[:checked]:border-white/30 has-[:checked]:bg-white/10">
                    <input
                      type="radio"
                      name="delay"
                      checked={form.reviewDelayMinutes === delay.value}
                      onChange={() => setForm({ ...form, reviewDelayMinutes: delay.value })}
                    />
                    {delay.label}
                  </label>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(3)}>{t("common.back")}</button>
                <button className="btn-primary" onClick={() => setStep(5)}>{t("common.continue")}</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">{t("onboard.readyTitle")}</h1>
              <p className="mt-1 text-sm text-muted">
                {t("onboard.readyHelp")}
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li><span className="text-muted">{t("onboard.business")}</span> {form.name}</li>
                <li><span className="text-muted">{t("onboard.type")}</span> {form.type}</li>
                <li><span className="text-muted">{t("onboard.reviewPage")}</span> {form.reviewUrl || t("onboard.addLater")}</li>
              </ul>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(4)}>{t("common.back")}</button>
                <button className="btn-primary" onClick={finish}>{t("onboard.goDash")}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
