import { Link } from "react-router-dom";
import { PRICE_PER_MONTH } from "../../config/pricing.js";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#E8F0FF_0%,transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-16 text-center md:pt-24">
        <span className="inline-flex items-center rounded-full border border-brand-100 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-600 shadow-sm">
          For local service businesses
        </span>
        <h1 className="display mx-auto mt-6 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl md:text-7xl">
          More reviews.
          <br />
          <span className="text-brand-500">Less chasing.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted md:text-xl">
          Mark a job complete. ReviewFlow emails the customer and sends them to your Google review page.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-cta">
            Start 7-day free trial
          </Link>
          <a href="#how" className="btn-secondary px-6 py-3.5 text-base">
            See how it works
          </a>
        </div>
        <p className="mt-4 text-sm text-muted">No card needed to start. Then {PRICE_PER_MONTH}.</p>
      </div>

      <div className="relative mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-3 px-4 sm:grid-cols-3">
        {[
          ["1", "Finish the job"],
          ["2", "We send the email"],
          ["3", "They leave a review"],
        ].map((item) => (
          <div key={item[0]} className="flex items-center gap-3 rounded-2xl border border-edge bg-white/80 px-4 py-3 text-left shadow-sm">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {item[0]}
            </span>
            <span className="text-sm font-semibold text-ink">{item[1]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
