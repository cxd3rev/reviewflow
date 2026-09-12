function Chip({ tone = "sent", children }) {
  const tones = {
    sent: "bg-white/10 text-zinc-200",
    open: "bg-emerald-500/15 text-emerald-300",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

const rows = [
  ["Jan de Vries", "E-mail", "12 sep", "sent"],
  ["Sara Bakker", "E-mail", "11 sep", "open"],
  ["Mohammed Ali", "E-mail", "10 sep", "sent"],
  ["Lisa Vermeer", "E-mail", "9 sep", "open"],
];

export function ProductMock() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-white/[0.03] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#111113] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.8)]">
        <div className="flex min-h-[420px]">
          <aside className="hidden w-40 shrink-0 border-r border-white/5 bg-[#0c0c0e] p-4 sm:block">
            <div className="mb-6 text-xs font-semibold tracking-tight text-white">starywrld</div>
            <nav className="space-y-1 text-sm">
              <div className="rounded-lg bg-white/10 px-3 py-2 font-medium text-white">Home</div>
              <div className="px-3 py-2 text-zinc-500">Klanten</div>
              <div className="px-3 py-2 text-zinc-500">Jobs</div>
              <div className="px-3 py-2 text-zinc-500">Instellingen</div>
            </nav>
          </aside>
          <div className="min-w-0 flex-1 p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="display text-lg font-semibold text-white">Dashboard</h3>
                <p className="mt-0.5 text-xs text-zinc-500">Overzicht van je reviewverzoeken</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden h-8 w-28 rounded-full border border-white/10 bg-white/5 sm:block" />
                <div className="h-8 w-8 rounded-full bg-white/15" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Verzonden", "128", "+12%"],
                ["Kliks", "47", "+8%"],
                ["Conversie", "18%", "+2%"],
                ["Reviews", "31", "+5%"],
              ].map((stat) => (
                <div key={stat[0]} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[11px] text-zinc-500">{stat[0]}</div>
                  <div className="mt-1 flex items-end justify-between gap-2">
                    <div className="display text-xl font-semibold tracking-tight text-white">{stat[1]}</div>
                    <span className="trend-up">{stat[2]}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
              <div className="px-3 py-2.5 text-xs font-semibold text-white">Review verzoeken</div>
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase tracking-wide text-zinc-500">
                  <tr className="border-t border-white/5">
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Klant</th>
                    <th className="hidden px-3 py-2 font-medium sm:table-cell">Kanaal</th>
                    <th className="px-3 py-2 font-medium">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row[0]} className="border-t border-white/5 text-zinc-300">
                      <td className="px-3 py-2.5">
                        <Chip tone={row[3]}>{row[3] === "open" ? "Geopend" : "Verzonden"}</Chip>
                      </td>
                      <td className="px-3 py-2.5 text-white">{row[0]}</td>
                      <td className="hidden px-3 py-2.5 sm:table-cell">{row[1]}</td>
                      <td className="px-3 py-2.5 text-zinc-500">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
