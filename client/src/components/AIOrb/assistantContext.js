import { PRICE_PER_MONTH } from "../../config/pricing.js";

/** Central product knowledge for the orb. Edit this file to teach it new facts. */
export const assistantContext = {
  product: {
    name: "starywrld",
    company: "ayv wrld",
    tagline: "Reviews that write themselves.",
    description:
      "starywrld automatically sends review-request emails after you finish a job. Built for trades and local services — not a heavy CRM.",
    audience:
      "Plumbers, electricians, painters, cleaners, landscapers, handymen, mechanics, builders, barbers, and beauty businesses.",
    setup: "A few minutes. Add your review URL, then your first customer and job.",
  },
  features: [
    "Automatic review-request emails after a job is marked completed, at the delay you choose.",
    "Send customers to Google Reviews or any review URL you already use.",
    "Simple customer list: names, emails, notes — enough to send the request.",
    "Editable email subject and message, with a preview before it sends.",
    "Clear request status: waiting, sent, failed, or cancelled.",
    `One plan: 7 days free, then starywrld Pro at ${PRICE_PER_MONTH}. Cancel anytime.`,
  ],
  pricing: {
    plan: "starywrld Pro",
    trial: "7-day free trial",
    price: PRICE_PER_MONTH,
    includes: [
      "Unlimited customers and jobs",
      "Automatic review request emails",
      "Custom email text and preview",
      "Waiting / sent / failed status",
    ],
    cancel: "Cancel anytime.",
  },
  howItWorks: [
    "Paste your Google review URL — or any other review page.",
    "Add the customer and the job.",
    "Mark the job completed. starywrld waits your chosen delay, then sends the email.",
    "The customer taps Leave a Review and lands on your review page.",
  ],
  faq: [
    {
      q: "How does starywrld work?",
      a: "After you mark a job as completed, starywrld waits for your chosen delay and emails the customer a review request with a button to your Google (or other) review page.",
      tags: ["how", "work", "works", "fonction", "funktioniert", "funciona"],
    },
    {
      q: "Do I need a Google Business Profile?",
      a: "You can use any review URL: Google, Facebook, your website, or another platform. starywrld simply sends customers there.",
      tags: ["google", "business", "profile", "url", "review page"],
    },
    {
      q: "How are review requests sent?",
      a: "By email, using the message you set in Settings. The button in that email opens your review page.",
      tags: ["email", "send", "request", "sms", "channel"],
    },
    {
      q: "What if a customer has no email?",
      a: "starywrld will not try to send a request. You'll see a clear message so you can add an email later.",
      tags: ["no email", "missing", "phone", "sms"],
    },
    {
      q: "How long does setup take?",
      a: "A few minutes. Add your review URL, then your first customer and job.",
      tags: ["setup", "onboarding", "start", "begin", "install"],
    },
    {
      q: "Is there a free trial?",
      a: `Yes. New accounts get 7 days free. After that, starywrld Pro is ${PRICE_PER_MONTH}. Cancel anytime.`,
      tags: ["trial", "free", "price", "pricing", "cost", "plan", "pay", "euro"],
    },
  ],
  pages: [
    { path: "/", name: "Landing", desc: "Product story, pricing, and FAQ." },
    { path: "/demo", name: "Demo", desc: "Scripted product walkthrough of landing and in-app screens." },
    { path: "/login", name: "Login", desc: "Sign in with your work email." },
    { path: "/signup", name: "Signup", desc: "Create an account and start the 7-day trial." },
    { path: "/onboarding", name: "Onboarding", desc: "Business name, trade, review URL, and send delay." },
    { path: "/app", name: "Dashboard", desc: "Sent requests, conversion, and recent jobs." },
    { path: "/app/customers", name: "Customers", desc: "Add people you worked for so requests can be emailed." },
    { path: "/app/jobs", name: "Jobs", desc: "Create work and mark it completed to trigger a request." },
    { path: "/app/requests", name: "Requests", desc: "See waiting, sent, failed, or cancelled emails." },
    { path: "/app/settings", name: "Settings", desc: "Review URL, delay, and the email template." },
    { path: "/app/billing", name: "Billing", desc: "Trial status, checkout, and subscription portal." },
  ],
  ui: {
    "get-started": { selector: "[data-ai-target='get-started']", page: "landing", desc: "Header Get started — opens signup." },
    "hero-get-started": { selector: "[data-ai-target='hero-get-started']", page: "landing", desc: "Hero Get started button." },
    login: { selector: "[data-ai-target='login']", page: "landing", desc: "Header Login." },
    "hero-login": { selector: "[data-ai-target='hero-login']", page: "landing", desc: "Hero Login." },
    pricing: { selector: "[data-ai-target='pricing']", page: "landing", desc: "Pricing card and trial CTA." },
    "pricing-cta": { selector: "[data-ai-target='pricing-cta']", page: "landing", desc: "Start free trial on the pricing card." },
    features: { selector: "[data-ai-target='features']", page: "landing", desc: "What you get section." },
    how: { selector: "[data-ai-target='how']", page: "landing", desc: "How it works steps." },
    faq: { selector: "[data-ai-target='faq']", page: "landing", desc: "Questions, answered." },
    "closing-cta": { selector: "[data-ai-target='closing-cta']", page: "landing", desc: "Bottom Get started." },
    "dashboard-stats": { selector: "[data-ai-target='dashboard-stats']", page: "app", desc: "Dashboard stat cards." },
    "new-job": { selector: "[data-ai-target='new-job']", page: "app", desc: "New job on the dashboard." },
    "add-customer": { selector: "[data-ai-target='add-customer']", page: "app", desc: "Add customer." },
    "add-job": { selector: "[data-ai-target='add-job']", page: "app", desc: "Add job." },
    "compare-without": { selector: "[data-ai-target='compare-without']", page: "landing", desc: "Without starywrld column." },
    "compare-with": { selector: "[data-ai-target='compare-with']", page: "landing", desc: "With starywrld column." },
    "product-mock": { selector: "[data-ai-target='product-mock']", page: "landing", desc: "Dashboard product mock." },
    "how-1": { selector: "[data-ai-target='how-1']", page: "landing", desc: "How it works step 1." },
    "how-2": { selector: "[data-ai-target='how-2']", page: "landing", desc: "How it works step 2." },
    "how-3": { selector: "[data-ai-target='how-3']", page: "landing", desc: "How it works step 3." },
    "how-4": { selector: "[data-ai-target='how-4']", page: "landing", desc: "How it works step 4." },
  },
  instructions: [
    "You are the starywrld product guide. Concise, calm, slightly mysterious. Never salesy.",
    "Answer only about starywrld, reviews, pricing, pages, and how to use the UI.",
    "Prefer 1–3 short sentences. No bullet walls unless the user asks for a list.",
    "If the user asks where something is, point to it and end with [[highlight:targetId]] using a key from the UI map.",
    "Do not invent integrations, SMS, WhatsApp, or features that are not listed.",
    "Never ask for or repeat API keys, passwords, or secrets.",
    "If unsure, say so and suggest Settings, Pricing, or FAQ.",
  ],
};

const HIGHLIGHT_RE = /\[\[highlight:([a-z0-9-]+)\]\]/gi;

const TOPIC_HIGHLIGHTS = [
  { test: /\b(pric|cost|plan|trial|€|euro|tarif|preis|precio)\b/i, id: "pricing" },
  { test: /\b(sign ?up|get started|start|trial|commencer|empezar|loslegen)\b/i, id: "get-started" },
  { test: /\b(log ?in|sign ?in|connexion|iniciar|anmelden)\b/i, id: "login" },
  { test: /\b(feature|what you get|included|fonction|funktion|función)\b/i, id: "features" },
  { test: /\b(how it works|how does|steps|comment ça|cómo funciona|wie funktioniert)\b/i, id: "how" },
  { test: /\b(faq|question)\b/i, id: "faq" },
  { test: /\b(stat|dashboard|conversion|sent)\b/i, id: "dashboard-stats" },
  { test: /\b(add customer|new customer|create customer)\b/i, id: "add-customer" },
  { test: /\b(add job|new job|create job)\b/i, id: "add-job" },
];

export function stripHighlightHint(text) {
  let highlight = null;
  const reply = String(text || "")
    .replace(HIGHLIGHT_RE, (_, id) => {
      highlight = id;
      return "";
    })
    .replace(/\s{2,}/g, " ")
    .trim();
  return { reply, highlight };
}

export function suggestHighlight(message) {
  const text = String(message || "");
  const match = TOPIC_HIGHLIGHTS.find((item) => item.test.test(text));
  return match?.id || null;
}

function tokens(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 1);
}

export function matchAssistantReply(message) {
  const words = tokens(message);
  const asked = words.join(" ");

  if (!words.length) {
    return {
      reply: "Ask about reviews, pricing, or how starywrld works.",
      highlight: null,
      source: "fallback",
    };
  }

  if (/\b(hello|hi|hey|bonjour|salut|hola|hallo)\b/.test(asked)) {
    return {
      reply: "I'm the starywrld guide. Ask about reviews, pricing, or where to click.",
      highlight: null,
      source: "fallback",
    };
  }

  if (/\b(price|pricing|cost|plan|trial|pay|tarif|preis|precio)\b/.test(asked)) {
    return {
      reply: `starywrld Pro is ${assistantContext.pricing.price} after a 7-day free trial. Cancel anytime.`,
      highlight: "pricing",
      source: "fallback",
    };
  }

  if (/\b(get started|sign ?up|start free|started|commencer|empezar|loslegen)\b/.test(asked)) {
    return {
      reply: "Click Get started to create an account. Setup takes a few minutes, then you get 7 days free.",
      highlight: "get-started",
      source: "fallback",
    };
  }

  if (/\b(log ?in|sign ?in|connexion|iniciar|anmelden)\b/.test(asked)) {
    return {
      reply: "Use Login in the header if you already have an account.",
      highlight: "login",
      source: "fallback",
    };
  }

  let best = { score: 0, item: null };
  for (const item of assistantContext.faq) {
    const hay = tokens([item.q, item.a, ...(item.tags || [])].join(" "));
    const score = words.reduce((sum, word) => sum + (hay.includes(word) ? 1 : 0), 0);
    if (score > best.score) best = { score, item };
  }

  if (best.item && best.score >= 1) {
    return {
      reply: best.item.a,
      highlight: suggestHighlight(message) || suggestHighlight(best.item.q),
      source: "fallback",
    };
  }

  if (/\b(customer|job|dashboard|settings|billing|request)\b/.test(asked)) {
    const page = assistantContext.pages.find((item) => asked.includes(item.name.toLowerCase()) || asked.includes(item.path.replace("/app/", "")));
    if (page) {
      return {
        reply: `${page.name}: ${page.desc}`,
        highlight: suggestHighlight(message),
        source: "fallback",
      };
    }
  }

  return {
    reply: `${assistantContext.product.description} ${assistantContext.faq[0].a}`,
    highlight: suggestHighlight(message),
    source: "fallback",
  };
}

export function buildSystemPrompt(locale = "en") {
  const ctx = assistantContext;
  return [
    ctx.instructions.join(" "),
    `Reply in locale "${locale}" when it is not English, still keep product names as-is.`,
    `Product: ${ctx.product.name} by ${ctx.product.company}. ${ctx.product.tagline} ${ctx.product.description}`,
    `Audience: ${ctx.product.audience}`,
    `How it works: ${ctx.howItWorks.join(" ")}`,
    `Features: ${ctx.features.join(" ")}`,
    `Pricing: ${ctx.pricing.plan}, ${ctx.pricing.trial}, ${ctx.pricing.price}. ${ctx.pricing.includes.join("; ")}. ${ctx.pricing.cancel}`,
    `FAQ: ${ctx.faq.map((item) => `${item.q} ${item.a}`).join(" ")}`,
    `Pages: ${ctx.pages.map((item) => `${item.path} ${item.name} — ${item.desc}`).join(" ")}`,
    `UI targets: ${Object.entries(ctx.ui)
      .map(([id, item]) => `${id}: ${item.desc}`)
      .join(" ")}`,
  ].join("\n");
}
