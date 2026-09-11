export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function delayLabel(minutes) {
  const map = {
    0: "Immediately",
    60: "1 hour",
    1440: "24 hours",
    2880: "48 hours",
    4320: "72 hours",
  };
  return map[minutes] || `${minutes} minutes`;
}

export function applyTemplate(template, vars) {
  return String(template || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}

export function jobStatusLabel(status) {
  return {
    scheduled: "Scheduled",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  }[status] || status;
}

export function requestStatusLabel(status) {
  return {
    scheduled: "Scheduled",
    sending: "Scheduled",
    sent: "Sent",
    failed: "Failed",
    cancelled: "Cancelled",
  }[status] || status;
}
