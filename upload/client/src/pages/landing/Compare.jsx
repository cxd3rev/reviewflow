export function Compare() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight md:text-5xl">Before and after</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          The difference between hoping for reviews and asking every time.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-edge bg-slate-50/80 p-8">
            <h3 className="text-xl font-semibold text-slate-700">Without ReviewFlow</h3>
            <p className="mt-1 text-sm text-muted">Reviews left to chance</p>
            <ul className="mt-6 space-y-3 text-slate-600">
              {[
                "Customers leave without being asked",
                "You remember to follow up — sometimes",
                "No record of who was asked",
                "Busy weeks mean zero review requests",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-slate-400">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-brand-700">With ReviewFlow</h3>
            <p className="mt-1 text-sm text-brand-600">Every completed job gets a follow-up</p>
            <ul className="mt-6 space-y-3 text-slate-700">
              {[
                "Every customer is asked at the right time",
                "Requests go out when you mark a job done",
                "Dashboard shows waiting vs sent",
                "You complete the work and check status",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 font-semibold text-brand-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
