import { useI18n } from "../../i18n/LanguageContext.jsx";

export function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, t, locales } = useI18n();
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-zinc-400 ${className}`}>
      <span className="sr-only">{t("common.language")}</span>
      <select
        className="rounded-lg border border-white/15 bg-[#141416] px-2 py-1.5 text-sm text-white outline-none focus:border-white/30"
        value={lang}
        onChange={(event) => setLang(event.target.value)}
        aria-label={t("common.language")}
      >
        {locales.map((locale) => (
          <option key={locale.id} value={locale.id}>
            {locale.label}
          </option>
        ))}
      </select>
    </label>
  );
}
