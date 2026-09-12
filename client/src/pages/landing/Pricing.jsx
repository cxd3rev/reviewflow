import { Link } from "react-router-dom";
import { PRICE_EUR } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export function Pricing() {
  const { t } = useI18n();
  return (
    <section id="pricing" className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("pricing.eyebrow")}</p>
        <h2 className="display mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("pricing.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t("pricing.subtitle")}</p>
        <div className="card mx-auto mt-12 max-w-md p-8 text-left">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-300">starywrld Pro</div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">{t("pricing.popular")}</span>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span className="display text-5xl font-bold tracking-tight text-white">{PRICE_EUR}</span>
            <span className="mb-1.5 text-muted">{t("common.perMonth")}</span>
          </div>
          <p className="mt-2 text-sm text-muted">{t("pricing.trial")}</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-300">
            {[t("pricing.i1"), t("pricing.i2"), t("pricing.i3"), t("pricing.i4")].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-white">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/signup" className="btn-cta mt-8 w-full">
            {t("pricing.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
