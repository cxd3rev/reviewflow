import { useI18n } from "../../i18n/LanguageContext.jsx";

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [
    ["1", t("how.s1t"), t("how.s1d")],
    ["2", t("how.s2t"), t("how.s2d")],
    ["3", t("how.s3t"), t("how.s3d")],
    ["4", t("how.s4t"), t("how.s4d")],
  ];
  return (
    <section id="how" className="border-t border-white/5 py-24" data-ai-target="how">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-center text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("how.eyebrow")}</p>
        <h2 className="display mx-auto mt-3 max-w-3xl text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {t("how.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">{t("how.subtitle")}</p>
        <div className="mt-14 grid gap-6 md:grid-cols-4">
          {steps.map((item) => (
            <div key={item[0]} className="rounded-2xl border border-white/10 bg-surface p-6" data-ai-target={`how-${item[0]}`}>
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                {item[0]}
              </div>
              <h3 className="text-base font-semibold text-white">{item[1]}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item[2]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
