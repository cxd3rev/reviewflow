import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useI18n } from "../../i18n/LanguageContext.jsx";
import { formatRelative } from "../../utils/format.js";

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || "there";
}

function conversionRate(sent, completed) {
  if (!completed) return "0%";
  return `${Math.min(100, Math.round((sent / completed) * 100))}%`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="alert-error">{error}</p>;
  if (!data) return <p className="text-sm text-muted">{t("common.loading")}</p>;

  const sent = data.stats.requestsSent;
  const stats = [
    { label: t("dash.sent"), value: sent, trend: data.stats.thisMonth ? `+${data.stats.thisMonth}` : null },
    { label: t("dash.clicks"), value: 0, trend: null },
    { label: t("dash.conversion"), value: conversionRate(sent, data.stats.completedJobs), trend: null },
    { label: t("dash.reviews"), value: data.stats.completedJobs, trend: null },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{t("dash.welcome", { name: firstName(user?.name) })}</p>
          <h1 className="display mt-1 text-3xl font-semibold tracking-tight text-white">{t("dash.title")}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t("dash.overview")}</p>
          <p className="mt-1 text-sm text-zinc-500">{t("dash.today")}</p>
        </div>
        <Link to="/app/jobs" className="btn-primary">
          {t("dash.newJob")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-zinc-500">{stat.label}</div>
              {stat.trend ? <span className="trend-up">{stat.trend}</span> : null}
            </div>
            <div className="display mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{t("dash.table")}</h2>
          <Link to="/app/requests" className="link">
            {t("common.all")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("common.status")}</th>
                <th>{t("common.customer")}</th>
                <th>{t("common.channel")}</th>
                <th>{t("common.date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentJobs.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan={4}>
                    {t("dash.empty")}
                  </td>
                </tr>
              )}
              {data.recentJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    {job.requestStatus ? (
                      <StatusBadge status={job.requestStatus} />
                    ) : (
                      <StatusBadge status={job.status} kind="job" />
                    )}
                  </td>
                  <td className="font-medium text-white">{job.customerName}</td>
                  <td className="text-zinc-400">{t("mock.email")}</td>
                  <td className="text-zinc-500">{formatRelative(job.requestScheduledAt || job.completedAt, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
