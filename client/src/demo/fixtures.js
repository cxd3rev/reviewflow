/** Fixture rows aligned with server/src/seed.js — not invented product data. */

export const DEMO_BUSINESS = {
  name: "Aron's Painting",
  type: "Painter",
  reviewUrl: "https://www.google.com/maps",
};

export const DEMO_CUSTOMERS = [
  { id: "c1", firstName: "John", lastName: "Smith", email: "john.smith@example.com", phone: "555-0101" },
  { id: "c2", firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@example.com", phone: "555-0102" },
  { id: "c3", firstName: "Michael", lastName: "Brown", email: "michael.brown@example.com", phone: "555-0103" },
];

export const DEMO_JOBS = [
  {
    id: "j1",
    customerId: "c1",
    customerName: "John Smith",
    title: "Interior painting",
    status: "completed",
    completedAt: "2 days ago",
  },
  {
    id: "j2",
    customerId: "c2",
    customerName: "Sarah Johnson",
    title: "Kitchen renovation",
    status: "in_progress",
    completedAt: "—",
  },
  {
    id: "j3",
    customerId: "c3",
    customerName: "Michael Brown",
    title: "Living room painting",
    status: "completed",
    completedAt: "1 day ago",
  },
];

export const DEMO_REQUESTS = [
  {
    id: "r1",
    customerName: "John Smith",
    jobTitle: "Interior painting",
    scheduledAt: "2 days ago",
    sentAt: "2 days ago",
    status: "sent",
  },
  {
    id: "r2",
    customerName: "Sarah Johnson",
    jobTitle: "Kitchen renovation",
    scheduledAt: "just now",
    sentAt: "—",
    status: "scheduled",
  },
  {
    id: "r3",
    customerName: "Michael Brown",
    jobTitle: "Living room painting",
    scheduledAt: "1 day ago",
    sentAt: "1 day ago",
    status: "sent",
  },
];

/** Matches real Dashboard math: sent count, clicks hardcoded 0, conversion from sent/completed. */
export const DEMO_STATS = [
  { key: "sent", value: "2", trend: "+2" },
  { key: "clicks", value: "0", trend: null },
  { key: "conversion", value: "67%", trend: null },
  { key: "reviews", value: "3", trend: null },
];
