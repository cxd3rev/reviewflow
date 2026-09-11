import { PRICE_PER_MONTH } from "../../config/pricing.js";

export const trades = [
  "Plumbers",
  "Electricians",
  "Painters",
  "Cleaners",
  "Landscapers",
  "Handymen",
  "Mechanics",
  "Builders",
  "Barbers",
  "Beauty businesses",
];

export const faqs = [
  {
    q: "How does starywrld work?",
    a: "After you mark a job as completed, starywrld waits for your chosen delay and emails the customer a review request with a button to your Google (or other) review page.",
  },
  {
    q: "Do I need a Google Business Profile?",
    a: "You can use any review URL: Google, Facebook, your website, or another platform. starywrld simply sends customers there.",
  },
  {
    q: "How are review requests sent?",
    a: "By email, using the message you set in Settings. The button in that email opens your review page.",
  },
  {
    q: "What if a customer has no email?",
    a: "starywrld will not try to send a request. You'll see a clear message so you can add an email later.",
  },
  {
    q: "How long does setup take?",
    a: "A few minutes. Add your review URL, then your first customer and job.",
  },
  {
    q: "Is there a free trial?",
    a: `Yes. New accounts get 7 days free. After that, starywrld Pro is ${PRICE_PER_MONTH}. Cancel anytime.`,
  },
];
