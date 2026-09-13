/**
 * Runs a demoScript without calling the AI API.
 * Steps: appear, move, speak (text balloon), highlight, bubble, state, openChat, closeChat, message, wait.
 */
export function createDemoController(api) {
  let cancelled = false;
  const timers = new Set();

  function wait(ms) {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        resolve();
      }, Math.max(0, ms || 0));
      timers.add(id);
    });
  }

  async function run(script) {
    cancelled = false;
    api.onStart?.();
    for (const step of script) {
      if (cancelled) break;
      const type = step.type;
      if (type === "appear") {
        api.setVisible(true);
        api.setOffset({ x: 0, y: 0 });
      } else if (type === "move") {
        api.setOffset({ x: step.x || 0, y: step.y || 0 });
      } else if (type === "state") {
        api.setOrbState(step.state || "idle");
      } else if (type === "openChat") {
        api.setChatOpen(true);
      } else if (type === "closeChat") {
        api.setChatOpen(false);
      } else if (type === "bubble") {
        api.setBubble(step.text || "");
      } else if (type === "highlight") {
        api.highlight(step.target, { duration: step.duration ?? 2400, pointer: step.pointer !== false });
      } else if (type === "message") {
        api.addMessage({
          id: `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          role: step.role === "user" ? "user" : "assistant",
          text: step.text || "",
        });
      } else if (type === "speak") {
        api.setOrbState("speaking");
        api.setBubble(step.text || "");
        await api.speak(step.text || "", step.duration ?? 2200);
        if (cancelled) break;
        api.setOrbState(api.isChatOpen() ? "open" : "idle");
      } else if (type === "click") {
        api.click?.(step.target);
      } else if (type === "navigate") {
        api.navigate?.(step.to);
      } else if (type === "fill") {
        api.fill?.(step);
      } else if (type === "wait") {
        /* delay only */
      }

      const delay = step.delay ?? (type === "wait" ? step.duration : 0);
      if (delay) await wait(delay);
    }
    if (!cancelled) {
      api.setBubble("");
      api.setOffset({ x: 0, y: 0 });
      api.setOrbState(api.isChatOpen() ? "open" : "idle");
    }
    api.onEnd?.();
  }

  function stop() {
    cancelled = true;
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    api.stopSpeech();
    api.clearHighlight();
    api.setBubble("");
    api.setOffset({ x: 0, y: 0 });
    api.onEnd?.();
  }

  return { run, stop };
}

export function demoRequested() {
  if (typeof window === "undefined") return false;
  const search = new URLSearchParams(window.location.search);
  if (search.get("demo") === "1") return true;
  const hash = window.location.hash || "";
  const q = hash.indexOf("?");
  if (q !== -1 && new URLSearchParams(hash.slice(q)).get("demo") === "1") return true;
  try {
    return localStorage.getItem("starywrld_demo") === "1";
  } catch {
    return false;
  }
}
