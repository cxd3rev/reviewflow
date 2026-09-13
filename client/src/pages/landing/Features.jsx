import { localizedPrice } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

function Icon({ children }) {
  return (
    <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white">
      {children}
    </span>
  );
}

const PATHS = [
  "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
];

export function Features() {
  const { t } = useI18n();
  const items = [1, 2, 3, 4, 5, 6].map((n, i) => ({
    title: t(`features.f${n}t`),
    text: n === 6 ? t("features.f6d", { price: localizedPrice(t) }) : t(`features.f${n}d`),
    path: PATHS[i],
  }));

  return (
    <section id="features" className="py-24" data-ai-target="features">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("features.eyebrow")}</p>
        <h2 className="display mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {t("features.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">{t("features.subtitle")}</p>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-surface p-6 transition hover:border-white/20">
              <Icon>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.path} />
                </svg>
              </Icon>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
