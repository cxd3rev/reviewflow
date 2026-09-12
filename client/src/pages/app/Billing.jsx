import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { PRICE_EUR, PRICE_PER_MONTH } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export default function Billing() {
  const { t } = useI18n();
  const { entitlement, billing, refresh } = useAuth();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (params.get("checkout") !== "success") return undefined;
    let cancelled = false;
    (async () => {
      try {
        if (sessionId) {
          await api("/api/billing/complete", {
            method: "POST",
            body: JSON.stringify({ sessionId }),
          });
        }
        if (!cancelled) await refresh();
      } catch {
        if (!cancelled) await refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
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
    if (!confirm(t("billing.confirmCancel"))) return;
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

  const planLabel = entitlement?.plan === "pro" ? t("billing.pro") : entitlement?.trialActive ? t("billing.trial") : t("billing.none");
  const localPro = entitlement?.plan === "pro" && String(entitlement?.stripeSubscriptionId || "").startsWith("local_");
  const stripeReady = billing?.stripeConfigured;

  return (
    <div className="max-w-lg">
      <PageHeader title={t("billing.title")} description={t("billing.desc")} />

      {params.get("checkout") === "success" && (
        <p className="alert-ok mb-4">{t("billing.success")}</p>
      )}
      {error && <p className="alert-error mb-4">{error}</p>}

      {!stripeReady && (
        <p className="alert-warn mb-4">{t("billing.stripeWarn")}</p>
      )}

      <div className="card p-8">
        <div className="text-sm font-semibold text-brand-600">starywrld Pro</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="display text-4xl font-bold tracking-tight">{PRICE_EUR}</span>
          <span className="text-muted">{t("common.perMonth")}</span>
        </div>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between border-b border-edge py-2">
            <dt className="text-muted">{t("billing.current")}</dt>
            <dd>{planLabel}</dd>
          </div>
          <div className="flex justify-between border-b border-edge py-2">
            <dt className="text-muted">{t("common.status")}</dt>
            <dd className="capitalize">{entitlement?.status || "none"}</dd>
          </div>
          {entitlement?.trialActive && (
            <div className="flex justify-between py-2">
              <dt className="text-muted">{t("billing.trialEnds")}</dt>
              <dd>
                {entitlement.daysLeft === 1 ? t("billing.inDay") : t("billing.inDays", { n: entitlement.daysLeft })}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-5 flex flex-col gap-2">
          {entitlement?.plan !== "pro" && (
            <button className="btn-primary" onClick={checkout} disabled={busy}>
              {stripeReady ? t("billing.subscribe", { price: PRICE_PER_MONTH }) : t("billing.activate")}
            </button>
          )}
          {entitlement?.stripeCustomerId && stripeReady && (
            <button className="btn-secondary" onClick={portal} disabled={busy}>
              {t("billing.manage")}
            </button>
          )}
          {localPro && (
            <button className="btn-secondary" onClick={cancelLocal} disabled={busy}>
              {t("billing.cancelSub")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
