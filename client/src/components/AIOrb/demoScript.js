/** Scripted walkthrough for product videos. Trigger with ?demo=1 or window.starywrldAssistant.startDemo(). */
export const demoScript = [
  { type: "appear", delay: 500 },
  { type: "state", state: "idle", delay: 400 },
  {
    type: "speak",
    text: "I'm the starywrld guide. Reviews that write themselves.",
    duration: 2800,
  },
  {
    type: "highlight",
    target: "[data-ai-target='hero-get-started']",
    duration: 2400,
    pointer: true,
  },
  {
    type: "bubble",
    text: "Start here — 7 days free.",
    delay: 1600,
  },
  {
    type: "highlight",
    target: "[data-ai-target='pricing']",
    duration: 2600,
    pointer: true,
  },
  {
    type: "speak",
    text: "One plan. Everything included. Then €29,99 a month.",
    duration: 2800,
  },
  { type: "openChat", delay: 200 },
  {
    type: "message",
    role: "user",
    text: "How do review requests get sent?",
    delay: 700,
  },
  { type: "state", state: "thinking", delay: 900 },
  {
    type: "message",
    role: "assistant",
    text: "You mark a job completed. starywrld waits your delay, then emails the customer a button to your review page.",
    delay: 200,
  },
  {
    type: "speak",
    text: "You mark a job completed. We wait, then we ask.",
    duration: 2600,
  },
  { type: "state", state: "open", delay: 800 },
];
