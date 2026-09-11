import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { PRICE_EUR, PRICE_PER_MONTH } from "../../config/pricing.js";

export default function Billing() {
  const { entitlement, billing, refresh } = useAuth();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("checkout") === "success") refresh();
  }, [params, refresh]);

  async function checkout() {
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/billing/checkout", { method: "POST" });
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function portal() {
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/billing/portal", { method: "POST" });
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function cancelLocal() {
    if (!confirm("Cancel ReviewFlow Pro?")) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/billing/cancel", { method: "POST" });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const planLabel = entitlement?.plan === "pro" ? "ReviewFlow Pro" : entitlement?.trialActive ? "Free trial" : "No active plan";
  const localPro = entitlement?.plan === "pro" && String(entitlement?.stripeSubscriptionId || "").startsWith("local_");
  const stripeReady = billing?.stripeConfigured;

  return (
    <div className="max-w-lg">
      <PageHeader title="Billing" description="One plan. Cancel whenever you like." />

      {params.get("checkout") === "success" && (
        <p className="alert-ok mb-4">Subscription started. It can take a few seconds to update.</p>
      )}
      {error && <p className="alert-error mb-4">{error}</p>}

      {!stripeReady && (
        <p className="alert-warn mb-4">
          Stripe is not connected yet, so subscribe activates Pro on this computer. To take real {PRICE_EUR} payments, add
          your Stripe keys to <code className="font-medium">.env</code>.
        </p>
      )}

      <div className="card p-8">
        <div className="text-sm font-semibold text-brand-600">ReviewFlow Pro</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="display text-4xl font-bold tracking-tight">{PRICE_EUR}</span>
          <span className="text-muted">/month</span>
        </div>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between border-b border-edge py-2">
            <dt className="text-muted">Current plan</dt>
            <dd>{planLabel}</dd>
          </div>
          <div className="flex justify-between border-b border-edge py-2">
            <dt className="text-muted">Status</dt>
            <dd className="capitalize">{entitlement?.status || "none"}</dd>
          </div>
          {entitlement?.trialActive && (
            <div className="flex justify-between py-2">
              <dt className="text-muted">Trial ends</dt>
              <dd>
                in {entitlement.daysLeft} day{entitlement.daysLeft === 1 ? "" : "s"}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-5 flex flex-col gap-2">
          {entitlement?.plan !== "pro" && (
            <button className="btn-primary" onClick={checkout} disabled={busy}>
              {stripeReady ? `Subscribe for ${PRICE_PER_MONTH}` : "Activate Pro (local test)"}
            </button>
          )}
          {entitlement?.stripeCustomerId && stripeReady && (
            <button className="btn-secondary" onClick={portal} disabled={busy}>
              Manage or cancel
            </button>
          )}
          {localPro && (
            <button className="btn-secondary" onClick={cancelLocal} disabled={busy}>
              Cancel subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
