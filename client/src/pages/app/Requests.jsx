import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { PageHeader } from "../../components/ui/PageHeader.jsx";
import { formatDateTime } from "../../utils/format.js";

const filters = [
  { id: "all", label: "Alles" },
  { id: "scheduled", label: "Gepland" },
  { id: "sent", label: "Verzonden" },
  { id: "failed", label: "Mislukt" },
  { id: "cancelled", label: "Geannuleerd" },
];

export default function Requests() {
  const [status, setStatus] = useState("all");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async (next = status) => {
    const data = await api(`/api/requests?status=${next}`);
    setRequests(data.requests);
  }, [status]);

  useEffect(() => {
    load(status).catch((err) => setError(err.message));
    const timer = setInterval(() => load(status).catch(() => {}), 8000);
    return () => clearInterval(timer);
  }, [load, status]);

  async function cancel(request) {
    await api(`/api/requests/${request.id}/cancel`, { method: "POST" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Review verzoeken"
        description="E-mails die wachten, al verzonden zijn, of geannuleerd."
      />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-surface p-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`rounded-lg px-3 py-1.5 text-sm ${status === filter.id ? "bg-white/10 font-medium text-white" : "text-muted hover:text-white"}`}
            onClick={() => setStatus(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <p className="alert-error mb-4">{error}</p>}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Job</th>
              <th>Scheduled</th>
              <th>Sent</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td className="text-muted" colSpan={6}>
                  No requests in this view. Complete a job to create one.
                </td>
              </tr>
            )}
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="font-medium text-ink">{request.customerName}</td>
                <td>{request.jobTitle}</td>
                <td className="text-muted">{formatDateTime(request.scheduledAt)}</td>
                <td className="text-muted">{formatDateTime(request.sentAt)}</td>
                <td>
                  <StatusBadge status={request.status} />
                  {request.errorMessage && <div className="mt-1 text-xs text-red-400">{request.errorMessage}</div>}
                </td>
                <td className="text-right">
                  {request.status === "scheduled" && (
                    <button className="text-sm font-medium text-red-400 hover:text-red-300" onClick={() => cancel(request)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
