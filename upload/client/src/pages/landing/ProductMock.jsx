export function ProductMock() {
  return (
    <div className="relative mx-auto max-w-4xl px-4 pb-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(2,8,23,0.28)]">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs font-medium text-slate-400">starywrld dashboard</span>
        </div>
        <div className="grid gap-0 md:grid-cols-5">
          <div className="hidden border-r border-slate-100 bg-slate-50/70 p-5 md:block">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Work</div>
            <div className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-brand-700 shadow-sm">Overview</div>
            <div className="mt-1 px-3 py-2 text-sm text-slate-500">Customers</div>
            <div className="px-3 py-2 text-sm text-slate-500">Jobs</div>
          </div>
          <div className="p-5 md:col-span-4">
            <div className="mb-4 text-sm font-semibold text-slate-500">Recent jobs</div>
            {[
              ["John Smith", "Bathroom renovation", "Sent"],
              ["Sarah Johnson", "Kitchen painting", "Waiting"],
              ["Michael Brown", "Living room", "Sent"],
            ].map((row) => (
              <div key={row[0]} className="flex items-center justify-between border-t border-slate-100 py-3.5 first:border-t-0">
                <div>
                  <div className="font-medium">{row[0]}</div>
                  <div className="text-sm text-muted">{row[1]}</div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row[2] === "Sent" ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-600"
                  }`}
                >
                  {row[2]}
                </span>
              </div>
            ))}
            <div className="mt-3 rounded-xl bg-paper px-4 py-3 text-sm text-muted">
              Job completed → review email scheduled automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
