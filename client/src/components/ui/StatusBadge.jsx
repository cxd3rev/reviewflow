import { useI18n } from "../../i18n/LanguageContext.jsx";

export function StatusBadge({ status, kind = "request" }) {
  const { t } = useI18n();
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
      ? {
          scheduled: t("status.jobScheduled"),
          in_progress: t("status.jobProgress"),
          completed: t("status.jobCompleted"),
          cancelled: t("status.jobCancelled"),
        }
      : {
          scheduled: t("status.reqWaiting"),
          sending: t("status.reqWaiting"),
          sent: t("status.reqSent"),
          failed: t("status.reqFailed"),
          cancelled: t("status.reqCancelled"),
        };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-white/10 text-zinc-300"}`}>
      {labels[status] || status}
    </span>
  );
}
