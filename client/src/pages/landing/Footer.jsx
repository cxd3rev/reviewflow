import { Link } from "react-router-dom";
import { AyvWrldLogo, Logo } from "../../components/ui/Logo.jsx";
import { APP_NAME, COMPANY_NAME } from "../../config/brand.js";
import { PRICE_PER_MONTH } from "../../config/pricing.js";

export function ClosingCta() {
  return (
    <section className="border-t border-white/5 py-24 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="display text-3xl font-semibold tracking-tight text-white md:text-5xl">Ready to never miss a review?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
          Turn completed jobs into review requests — automatically.
        </p>
        <Link to="/signup" className="btn-cta mt-8">
          Get started
        </Link>
        <p className="mt-4 text-sm text-zinc-500">Then {PRICE_PER_MONTH}. Cancel anytime.</p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-14 text-sm text-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-4">
        <div>
          <div className="flex flex-wrap items-center gap-4">
            <Logo variant="wordmark" />
            <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />
            <AyvWrldLogo className="ayv-on-dark h-10 w-auto opacity-90 md:h-12" />
          </div>
          <p className="mt-3 max-w-xs leading-6">Automatically request reviews after completed jobs.</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Product</h3>
          <ul className="space-y-2">
            <li><a className="hover:text-white" href="#how">How it works</a></li>
            <li><a className="hover:text-white" href="#features">Features</a></li>
            <li><a className="hover:text-white" href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Account</h3>
          <ul className="space-y-2">
            <li><Link className="hover:text-white" to="/login">Login</Link></li>
            <li><Link className="hover:text-white" to="/signup">Get started</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold text-white">Legal</h3>
          <p>
            © {new Date().getFullYear()} {APP_NAME} by {COMPANY_NAME}
          </p>
        </div>
      </div>
    </footer>
  );
}
