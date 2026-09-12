import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
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
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="alert-error">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const sent = data.stats.requestsSent;
  const stats = [
    { label: "Verzonden", value: sent, trend: data.stats.thisMonth ? `+${data.stats.thisMonth}` : null },
    { label: "Kliks", value: 0, trend: null },
    { label: "Conversie", value: conversionRate(sent, data.stats.completedJobs), trend: null },
    { label: "Reviews", value: data.stats.completedJobs, trend: null },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Welcome back, {firstName(user?.name)}</p>
          <h1 className="display mt-1 text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">Overzicht van je reviewverzoeken</p>
          <p className="mt-1 text-sm text-zinc-500">Here&apos;s what&apos;s happening with your reviews today.</p>
        </div>
        <Link to="/app/jobs" className="btn-primary">
          New job
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
          <h2 className="text-sm font-semibold text-white">Review verzoeken</h2>
          <Link to="/app/requests" className="link">
            Alles
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Klant</th>
                <th>Kanaal</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {data.recentJobs.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan={4}>
                    Nog geen verzoeken. Voeg een klant toe en rond een job af.
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
                  <td className="text-zinc-400">E-mail</td>
                  <td className="text-zinc-500">{formatRelative(job.requestScheduledAt || job.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
