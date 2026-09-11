import { trades } from "./data.js";

export function Audience() {
  return (
    <section id="who" className="border-y border-edge bg-paper py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight md:text-5xl">Made for local services</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          If you finish jobs for customers and want more reviews without following up by hand, this is for you.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {trades.map((trade) => (
            <span key={trade} className="rounded-full border border-edge bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              {trade}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
