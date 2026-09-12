import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "../ui/Logo.jsx";
import { LanguageSwitcher } from "../ui/LanguageSwitcher.jsx";
import { PRICE_PER_MONTH } from "../../config/pricing.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";

function Icon({ name }) {
  const paths = {
    home: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
    users: "M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M11 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
    briefcase: "M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 7h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z",
    mail: "M4 6h16v12H4V6zm0 0l8 7 8-7",
    cog: "M12 15a3 3 0 100-6 3 3 0 000 6zm8.66-3a6.8 6.8 0 00-.14-1.4l2-1.55-2-3.46-2.4.96a7.1 7.1 0 00-2.42-1.4L13.4 2h-2.8L10.3 4.15a7.1 7.1 0 00-2.42 1.4l-2.4-.96-2 3.46 2 1.55A6.8 6.8 0 004.34 12c0 .48.05.94.14 1.4l-2 1.55 2 3.46 2.4-.96a7.1 7.1 0 002.42 1.4L10.6 22h2.8l.3-2.15a7.1 7.1 0 002.42-1.4l2.4.96 2-3.46-2-1.55c.09-.46.14-.92.14-1.4z",
    card: "M3 7h18v10H3V7zm0 3h18",
  };
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

function NavItems({ links }) {
  return links.map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
          isActive ? "bg-white/10 font-semibold text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon name={link.icon} />
      {link.label}
    </NavLink>
  ));
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "S";
}

export default function Layout() {
  const { user, business, entitlement, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const workLinks = [
    { to: "/app", label: t("nav.home"), end: true, icon: "home" },
    { to: "/app/customers", label: t("nav.customers"), icon: "users" },
    { to: "/app/jobs", label: t("nav.jobs"), icon: "briefcase" },
    { to: "/app/requests", label: t("nav.requests"), icon: "mail" },
  ];
  const accountLinks = [
    { to: "/app/settings", label: t("nav.settings"), icon: "cog" },
    { to: "/app/billing", label: t("nav.billing"), icon: "card" },
  ];

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-[#0c0c0e] md:flex">
        <div className="px-5 py-5">
          <Logo to="/app" variant="wordmark" />
          {business?.name ? <p className="mt-3 truncate text-xs text-zinc-500">{business.name}</p> : null}
        </div>
        <nav className="flex-1 space-y-6 px-3 py-2">
          <div className="space-y-1">
            <NavItems links={workLinks} />
          </div>
          <div className="space-y-1">
            <NavItems links={accountLinks} />
          </div>
        </nav>
        <div className="border-t border-white/10 px-5 py-4">
          <LanguageSwitcher className="mb-3" />
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <button className="mt-1 text-sm text-zinc-500 hover:text-white" onClick={handleLogout}>
            {t("common.logOut")}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-8">
          <div className="md:hidden">
            <Logo to="/app" variant="mark" />
          </div>
          <label className="relative hidden min-w-0 flex-1 md:block">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
              </svg>
            </span>
            <input className="input max-w-sm pl-9" type="search" placeholder={t("common.search")} aria-label={t("common.search")} />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white" title={user?.name}>
              {initials(user?.name)}
            </div>
            <button className="text-sm text-zinc-500 md:hidden" onClick={handleLogout}>
              {t("common.logOut")}
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 md:hidden">
          {[...workLinks, ...accountLinks].map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                  isActive ? "bg-white/10 font-medium text-white" : "text-zinc-400"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {entitlement?.trialActive && (
          <div className="border-b border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm text-zinc-300">
            {entitlement.daysLeft === 1 ? t("trial.leftOne") : t("trial.left", { n: entitlement.daysLeft })}{" "}
            <NavLink to="/app/billing" className="font-medium text-white underline">
              {t("trial.subscribe", { price: PRICE_PER_MONTH })}
            </NavLink>
          </div>
        )}
        {entitlement && !entitlement.allowed && (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-200">
            {t("trial.ended")}{" "}
            <NavLink to="/app/billing" className="font-medium underline">
              {t("trial.keep")}
            </NavLink>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
