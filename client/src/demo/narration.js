/**
 * All product-demo narration in one place.
 * Shown as speech bubbles on the orb — no voice, TTS, or audio files.
 * Copy matches existing product facts only — do not invent features here.
 */
export const narration = {
  hook:
    "I'm the starywrld guide. Reviews that write themselves. After you finish a job, we ask for the review — automatically.",
  problem:
    "Chasing reviews by hand does not scale. Customers leave without being asked. Busy weeks mean zero review requests.",
  how1: "First, paste your Google review URL — or any other review page you already use.",
  how2: "Add the customer and the job. A simple list of who you worked for and what you did.",
  how3: "Mark the job completed. starywrld waits your chosen delay, then sends the email.",
  how4: "They tap Leave a Review and land on your review page. You see waiting versus sent.",
  customers:
    "Here is the customer list. Names, emails, notes — enough to send the request. Not a heavy CRM.",
  job: "Create the job, then mark it completed. That is the only trigger.",
  processing:
    "starywrld schedules the review request. Status stays waiting until the email goes out.",
  result:
    "The request is sent. The customer gets an email with a button to your review page.",
  benefit:
    "The dashboard shows sent requests and recent jobs. You do the work. We do the follow-up.",
  aiOpen: "Need a hand? This is the same guide. Click the orb and ask.",
  aiAsk: "How do I do this?",
  aiReply:
    "You mark a job completed. starywrld waits your delay, then emails the customer a button to your review page.",
  benefits:
    "Less chasing. Automatic emails. A simple UI. And a guide when you get stuck.",
  cta: "Get started. Seven days free, then starywrld Pro. Cancel anytime.",
};

export function line(id) {
  return narration[id] || "";
}
