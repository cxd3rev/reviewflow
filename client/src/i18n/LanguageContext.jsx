import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LOCALES, strings } from "./strings.js";

const STORAGE_KEY = "starywrld_lang";
const LanguageContext = createContext(null);

function lookup(dict, key) {
  return key.split(".").reduce((node, part) => (node && node[part] !== undefined ? node[part] : undefined), dict);
}

function interpolate(value, vars) {
  if (!vars) return value;
  return String(value).replace(/\{\{(\w+)\}\}/g, (_, name) => (vars[name] == null ? "" : String(vars[name])));
}

function readStoredLang() {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (fromQuery && strings[fromQuery]) return fromQuery;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && strings[stored]) return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo(() => {
    function t(key, vars) {
      const raw = lookup(strings[lang], key) ?? lookup(strings.en, key) ?? key;
      return interpolate(raw, vars);
    }
    function setLang(next) {
      if (strings[next]) setLangState(next);
    }
    return { lang, setLang, t, locales: LOCALES };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
