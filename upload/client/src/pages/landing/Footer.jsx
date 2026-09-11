import { Link } from "react-router-dom";
import { Logo } from "../../components/ui/Logo.jsx";
import { PRICE_PER_MONTH } from "../../config/pricing.js";

export function ClosingCta() {
  return (
    <section className="border-t border-edge bg-ink py-24 text-center text-white">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="display text-3xl font-semibold tracking-tight md:text-5xl">Ready to never miss a review?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
          Turn completed jobs into review requests — automatically.
        </p>
        <Link to="/signup" className="btn-cta mt-8">
          Start 7-day free trial
        </Link>
        <p className="mt-4 text-sm text-slate-400">Then {PRICE_PER_MONTH}. Cancel anytime.</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-edge bg-white py-14 text-sm text-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4">
        <div>
          <Logo variant="wordmark" />
          <p className="mt-3 max-w-xs leading-6">Automatically request reviews after completed jobs.</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-ink">Product</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-ink" href="#how">How it works</a></li>
            <li><a className="hover:text-ink" href="#features">Features</a></li>
            <li><a className="hover:text-ink" href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-ink">Account</h3>
          <ul className="space-y-2">
            <li><Link className="hover:text-ink" to="/login">Log in</Link></li>
            <li><Link className="hover:text-ink" to="/signup">Start free trial</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-ink">Legal</h3>
          <p>© {new Date().getFullYear()} ReviewFlow</p>
        </div>
      </div>
    </footer>
  );
}
