import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "../ui/Logo.jsx";
import { PRICE_PER_MONTH } from "../../config/pricing.js";
import { useAuth } from "../../context/AuthContext.jsx";

const workLinks = [
  { to: "/app", label: "Overview", end: true },
  { to: "/app/customers", label: "Customers" },
  { to: "/app/jobs", label: "Jobs" },
  { to: "/app/requests", label: "Requests" },
];

const accountLinks = [
  { to: "/app/settings", label: "Settings" },
  { to: "/app/billing", label: "Billing" },
];

function NavItems({ links }) {
  return links.map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.end}
      className={({ isActive }) =>
        `block rounded-xl px-3 py-2 text-sm transition ${
          isActive ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
        }`
      }
    >
      {link.label}
    </NavLink>
  ));
}

export default function Layout() {
  const { user, business, entitlement, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-paper md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-edge bg-white md:flex">
        <div className="border-b border-edge px-5 py-5">
          <Logo to="/app" />
          <p className="mt-3 truncate text-sm text-muted">{business?.name}</p>
        </div>
        <nav className="flex-1 space-y-6 px-3 py-5">
          <div>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Work</p>
            <NavItems links={workLinks} />
          </div>
          <div>
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
            <NavItems links={accountLinks} />
          </div>
        </nav>
        <div className="border-t border-edge px-5 py-4">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <button className="mt-1 text-sm text-muted hover:text-ink" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-edge bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Logo to="/app" />
            <button className="text-sm text-muted" onClick={handleLogout}>
              Log out
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {[...workLinks, ...accountLinks].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                    isActive ? "bg-brand-50 font-medium text-ink" : "text-slate-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>

        {entitlement?.trialActive && (
          <div className="border-b border-brand-100 bg-brand-50 px-4 py-2.5 text-center text-sm text-ink">
            Trial: {entitlement.daysLeft} day{entitlement.daysLeft === 1 ? "" : "s"} left.{" "}
            <NavLink to="/app/billing" className="font-medium text-brand-600 underline">
              Subscribe — {PRICE_PER_MONTH}
            </NavLink>
          </div>
        )}
        {entitlement && !entitlement.allowed && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-sm text-red-900">
            Your trial has ended.{" "}
            <NavLink to="/app/billing" className="font-medium underline">
              Subscribe to keep sending requests
            </NavLink>
          </div>
        )}

        <main className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
