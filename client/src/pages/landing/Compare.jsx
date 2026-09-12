export function Compare() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="display text-center text-3xl font-semibold tracking-tight text-white md:text-5xl">Before and after</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted">
          The difference between hoping for reviews and asking every time.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0f0f11] p-8">
            <h3 className="text-xl font-semibold text-zinc-300">Without starywrld</h3>
            <p className="mt-1 text-sm text-muted">Reviews left to chance</p>
            <ul className="mt-6 space-y-3 text-zinc-400">
              {[
                "Customers leave without being asked",
                "You remember to follow up — sometimes",
                "No record of who was asked",
                "Busy weeks mean zero review requests",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 text-zinc-600">×</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/15 bg-surface p-8">
            <h3 className="text-xl font-semibold text-white">With starywrld</h3>
            <p className="mt-1 text-sm text-zinc-400">Every completed job gets a follow-up</p>
            <ul className="mt-6 space-y-3 text-zinc-300">
              {[
                "Every customer is asked at the right time",
                "Requests go out when you mark a job done",
                "Dashboard shows waiting vs sent",
                "You complete the work and check status",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 font-semibold text-white">✓</span>
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
