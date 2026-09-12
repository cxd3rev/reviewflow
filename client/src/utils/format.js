export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatRelative(value, t) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  const translate = t || ((key, vars) => {
    if (key === "time.justNow") return "just now";
    if (key === "time.minAgo") return `${vars.n} min ago`;
    if (key === "time.hourAgo") return `${vars.n} hours ago`;
    if (key === "time.yesterday") return "yesterday";
    if (key === "time.daysAgo") return `${vars.n} days ago`;
    return key;
  });
  if (Math.abs(mins) < 1) return translate("time.justNow");
  if (mins < 60 && mins >= 0) return translate("time.minAgo", { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24 && hours >= 0) return translate("time.hourAgo", { n: hours });
  const days = Math.round(hours / 24);
  if (days === 1) return translate("time.yesterday");
  if (days < 7 && days >= 0) return translate("time.daysAgo", { n: days });
  return formatDate(value);
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
