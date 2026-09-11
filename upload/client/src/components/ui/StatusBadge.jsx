export function StatusBadge({ status, kind = "request" }) {
  const styles =
    kind === "job"
      ? {
          scheduled: "bg-slate-100 text-slate-700",
          in_progress: "bg-sky-50 text-sky-800",
          completed: "bg-emerald-50 text-emerald-800",
          cancelled: "bg-slate-100 text-slate-500",
        }
      : {
          scheduled: "bg-sky-50 text-sky-800",
          sending: "bg-sky-50 text-sky-800",
          sent: "bg-emerald-50 text-emerald-800",
          failed: "bg-red-50 text-red-800",
          cancelled: "bg-slate-100 text-slate-500",
        };

  const labels =
    kind === "job"
      ? { scheduled: "Scheduled", in_progress: "In progress", completed: "Completed", cancelled: "Cancelled" }
      : { scheduled: "Waiting", sending: "Waiting", sent: "Sent", failed: "Failed", cancelled: "Cancelled" };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-700"}`}>
      {labels[status] || status}
    </span>
  );
}
