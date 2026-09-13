import { Link } from "react-router-dom";
import { AyvWrldLogo, Logo } from "../../components/ui/Logo.jsx";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher.jsx";
import { APP_NAME, COMPANY_NAME } from "../../config/brand.js";
import { PRICE_PER_MONTH } from "../../config/pricing.js";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export function ClosingCta() {
  const { t } = useI18n();
  return (
    <section className="border-t border-white/5 py-24 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="display text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("cta.title")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">{t("cta.subtitle")}</p>
        <Link to="/signup" className="btn-cta mt-8" data-ai-target="closing-cta">
          {t("common.getStarted")}
        </Link>
        <p className="mt-4 text-sm text-zinc-500">{t("cta.after", { price: PRICE_PER_MONTH })}</p>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-white/5 py-14 text-sm text-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <Logo variant="wordmark" />
            <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />
            <AyvWrldLogo className="h-12 w-auto md:h-14" />
          </div>
          <p className="mt-3 max-w-xs leading-6">{t("footer.blurb")}</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("footer.product")}</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-white" href="#demo">{t("landingDemo.eyebrow")}</a></li>
            <li><a className="hover:text-white" href="#how">{t("footer.how")}</a></li>
            <li><a className="hover:text-white" href="#features">{t("footer.features")}</a></li>
            <li><a className="hover:text-white" href="#pricing">{t("footer.pricing")}</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("footer.account")}</h3>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" to="/login">{t("common.login")}</Link></li>
            <li><Link className="hover:text-white" to="/signup">{t("common.getStarted")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">{t("footer.legal")}</h3>
          <p>
            © {new Date().getFullYear()} {APP_NAME} by {COMPANY_NAME}
          </p>
          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{t("common.language")}</p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
