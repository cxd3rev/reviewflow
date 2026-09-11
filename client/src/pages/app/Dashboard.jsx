import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { formatDate } from "../../utils/format.js";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="alert-error">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  const stats = [
    { label: "Jobs completed", value: data.stats.completedJobs },
    { label: "Requests sent", value: data.stats.requestsSent },
    { label: "Waiting to send", value: data.stats.pending },
    { label: "Sent this month", value: data.stats.thisMonth },
  ];

  return (
    <div>
      <PageHeader
        title="Overview"
        description="See how many review requests went out, and which jobs still need one."
        action={
          <Link to="/app/jobs" className="btn-primary">
            New job
          </Link>
        }
      />

      <p className="mb-6 text-sm text-slate-500">
        Typical flow: add a customer → create a job → mark it completed.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="text-sm text-muted">{stat.label}</div>
            <div className="display mt-2 text-3xl font-semibold tracking-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold">Recent jobs</h2>
          <Link to="/app/jobs" className="link">
            All jobs
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Job</th>
                <th>Completed</th>
                <th>Review email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentJobs.length === 0 && (
                <tr>
                  <td className="text-muted" colSpan={5}>
                    Nothing here yet. Add a customer, then a job.
                  </td>
                </tr>
              )}
              {data.recentJobs.map((job) => (
                <tr key={job.id}>
                  <td className="font-medium text-ink">{job.customerName}</td>
                  <td>{job.title}</td>
                  <td className="text-muted">{formatDate(job.completedAt)}</td>
                  <td className="text-muted">{formatDate(job.requestScheduledAt)}</td>
                  <td>
                    {job.requestStatus ? (
                      <StatusBadge status={job.requestStatus} />
                    ) : (
                      <StatusBadge status={job.status} kind="job" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
