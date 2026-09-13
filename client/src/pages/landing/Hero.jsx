import { Link } from "react-router-dom";
import { localizedPrice } from "../../config/pricing.js";
import { ProductMock } from "./ProductMock.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(61,126,255,0.12),transparent_50%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:px-6 md:pt-24 lg:grid-cols-2 lg:gap-16 lg:pb-28">
        <div>
          <p className="text-sm font-medium tracking-wide text-zinc-400">{t("hero.kicker")}</p>
          <h1 className="display mt-4 text-[2.7rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-zinc-400 md:text-xl">{t("hero.subtitle")}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/signup" className="btn-cta" data-ai-target="hero-get-started">
              {t("common.getStarted")}
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3.5 text-base" data-ai-target="hero-login">
              {t("common.login")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-500">{t("hero.trial", { price: localizedPrice(t) })}</p>
        </div>
        <ProductMock />
      </div>
    </section>
  );
}
