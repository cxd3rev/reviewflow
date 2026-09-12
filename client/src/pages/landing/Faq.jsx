import { useState } from "react";
import { PRICE_PER_MONTH } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export function Faq() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    q: t(`faq.q${n}`),
    a: n === 6 ? t("faq.a6", { price: PRICE_PER_MONTH }) : t(`faq.a${n}`),
  }));

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("faq.title")}</h2>
        <p className="mt-4 text-center text-lg text-muted">{t("faq.subtitle")}</p>
        <div className="mt-12 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-surface">
          {faqs.map((item, index) => (
            <div key={item.q} className="px-5">
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-white md:text-lg"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                {item.q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm text-muted">
                  {openFaq === index ? "–" : "+"}
                </span>
              </button>
              {openFaq === index && <p className="pb-5 leading-7 text-muted">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
