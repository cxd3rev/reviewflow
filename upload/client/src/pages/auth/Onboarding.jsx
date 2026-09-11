import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Logo } from "../../components/ui/Logo.jsx";

const TYPES = ["Plumber", "Electrician", "Cleaner", "Painter", "Mechanic", "Contractor", "Landscaper", "Barber", "Beauty", "Handyman", "Other"];
const DELAYS = [
  { value: 0, label: "Immediately" },
  { value: 60, label: "1 hour" },
  { value: 1440, label: "24 hours" },
  { value: 2880, label: "48 hours" },
  { value: 4320, label: "72 hours" },
];

export default function Onboarding() {
  const { business, setBusiness, refresh } = useAuth();
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
        <div className="mb-8 flex justify-center">
          <Logo to="/" variant="wordmark" />
        </div>
        <div className="mb-4 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-brand-400" : "bg-slate-200"}`} />
          ))}
        </div>
        <p className="mb-3 text-sm text-muted">Step {step} of 5</p>
        <div className="card p-7">
          {error && <p className="alert-error mb-4">{error}</p>}

          {step === 1 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">Business name</h1>
              <p className="mt-1 text-sm text-muted">This is what customers see in the review email.</p>
              <input className="input mt-5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <button className="btn-primary mt-5" disabled={!form.name.trim()} onClick={() => setStep(2)}>
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">What kind of work do you do?</h1>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition ${form.type === type ? "border-brand-400 bg-brand-50 font-medium text-ink" : "border-edge bg-white hover:border-slate-300"}`}
                    onClick={() => setForm({ ...form, type })}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary" disabled={!form.type} onClick={() => setStep(3)}>Continue</button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">Where should reviews go?</h1>
              <p className="mt-1 text-sm text-muted">Paste your Google review link, or any other review page.</p>
              <input
                className="input mt-5"
                placeholder="https://g.page/r/your-business/review"
                value={form.reviewUrl}
                onChange={(e) => setForm({ ...form, reviewUrl: e.target.value })}
              />
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn-primary" onClick={() => setStep(4)}>Continue</button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">When should we ask?</h1>
              <p className="mt-1 text-sm text-muted">Most businesses wait 24 hours after the job is done.</p>
              <div className="mt-5 space-y-2">
                {DELAYS.map((delay) => (
                  <label key={delay.value} className="flex items-center gap-3 rounded-xl border border-edge px-3 py-2.5 text-sm has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
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
                <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
                <button className="btn-primary" onClick={() => setStep(5)}>Continue</button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="display text-xl font-semibold tracking-tight">You’re ready</h1>
              <p className="mt-1 text-sm text-muted">
                Next: add a customer, create a job, then mark it completed.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                <li><span className="text-muted">Business:</span> {form.name}</li>
                <li><span className="text-muted">Type:</span> {form.type}</li>
                <li><span className="text-muted">Review page:</span> {form.reviewUrl || "Add later in Settings"}</li>
              </ul>
              <div className="mt-5 flex gap-2">
                <button className="btn-secondary" onClick={() => setStep(4)}>Back</button>
                <button className="btn-primary" onClick={finish}>Go to dashboard</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
