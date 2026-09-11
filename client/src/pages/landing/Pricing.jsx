import { Link } from "react-router-dom";
import { PRICE_EUR } from "../../config/pricing.js";

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-edge bg-paper py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Pricing</p>
        <h2 className="display mt-3 text-3xl font-semibold tracking-tight md:text-5xl">One plan. Everything included.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">Start free for 7 days. Upgrade when you’re ready.</p>
        <div className="card mx-auto mt-12 max-w-md p-8 text-left shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-brand-600">starywrld Pro</div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">Most popular</span>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <span className="display text-5xl font-bold tracking-tight">{PRICE_EUR}</span>
            <span className="mb-1.5 text-muted">/month</span>
          </div>
          <p className="mt-2 text-sm text-muted">7-day free trial. Cancel anytime.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {[
              "Unlimited customers and jobs",
              "Automatic review request emails",
              "Custom email text and preview",
              "Waiting / sent / failed status",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-brand-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/signup" className="btn-cta mt-8 w-full">
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  );
}
