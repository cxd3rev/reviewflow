import { useI18n } from "../../i18n/LanguageContext.jsx";

export function Compare() {
  const { t } = useI18n();
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("compare.title")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">{t("compare.subtitle")}</p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0f0f11] p-8">
            <h3 className="text-xl font-semibold text-zinc-300">{t("compare.without")}</h3>
            <p className="mt-1 text-sm text-muted">{t("compare.withoutSub")}</p>
            <ul className="mt-6 space-y-3 text-zinc-400">
              {[t("compare.w1"), t("compare.w2"), t("compare.w3"), t("compare.w4")].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-zinc-600">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/15 bg-surface p-8">
            <h3 className="text-xl font-semibold text-white">{t("compare.with")}</h3>
            <p className="mt-1 text-sm text-zinc-400">{t("compare.withSub")}</p>
            <ul className="mt-6 space-y-3 text-zinc-300">
              {[t("compare.a1"), t("compare.a2"), t("compare.a3"), t("compare.a4")].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 font-semibold text-white">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
