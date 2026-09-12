export function StatusBadge({ status, kind = "request" }) {
  const styles =
    kind === "job"
      ? {
          scheduled: "bg-white/10 text-zinc-300",
          in_progress: "bg-sky-500/15 text-sky-300",
          completed: "bg-emerald-500/15 text-emerald-300",
          cancelled: "bg-white/5 text-zinc-500",
        }
      : {
          scheduled: "bg-sky-500/15 text-sky-300",
          sending: "bg-sky-500/15 text-sky-300",
          sent: "bg-white/10 text-zinc-200",
          failed: "bg-red-500/15 text-red-300",
          cancelled: "bg-white/5 text-zinc-500",
        };

  const labels =
    kind === "job"
      ? { scheduled: "Gepland", in_progress: "Bezig", completed: "Afgerond", cancelled: "Geannuleerd" }
      : { scheduled: "Gepland", sending: "Gepland", sent: "Verzonden", failed: "Mislukt", cancelled: "Geannuleerd" };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-white/10 text-zinc-300"}`}>
      {labels[status] || status}
    </span>
  );
}
