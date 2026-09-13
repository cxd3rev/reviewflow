import { Link } from "react-router-dom";
import { Logo } from "../../components/ui/Logo.jsx";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <Logo variant="wordmark" />
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link to="/signup" className="btn-primary px-4 sm:px-5" data-ai-target="get-started">
            {t("header.getStarted")}
          </Link>
          <Link to="/login" className="btn-ghost border border-white/20 px-4 sm:px-5 text-white" data-ai-target="login">
            {t("header.login")}
          </Link>
        </div>
      </div>
    </header>
  );
}
