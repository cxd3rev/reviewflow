import { Link } from "react-router-dom";
import { Logo } from "../../components/ui/Logo.jsx";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 md:px-6">
        <Logo variant="wordmark" />
        <nav className="hidden items-center gap-7 text-[15px] text-slate-500 md:flex">
          <a className="transition hover:text-ink" href="#how">How it works</a>
          <a className="transition hover:text-ink" href="#features">Features</a>
          <a className="transition hover:text-ink" href="#pricing">Pricing</a>
          <a className="transition hover:text-ink" href="#faq">FAQ</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden text-sm font-semibold text-slate-600 sm:inline hover:text-ink">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary px-5">
            Start free trial
          </Link>
        </div>
      </div>
      <div className="nav-rainbow" />
    </header>
  );
}
