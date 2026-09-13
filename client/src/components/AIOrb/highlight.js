const HIGHLIGHT_CLASS = "ai-orb-highlight";
const POINTER_ID = "ai-orb-pointer";

let clearTimer = 0;
let resizeHandler = null;
let currentEl = null;

function resolveTarget(selectorOrId) {
  if (!selectorOrId || typeof document === "undefined") return null;
  const raw = String(selectorOrId).trim();
  if (!raw) return null;
  if (raw.startsWith("#") || raw.startsWith(".") || raw.startsWith("[")) {
    return document.querySelector(raw);
  }
  return (
    document.querySelector(`[data-ai-target="${raw}"]`) ||
    document.getElementById(raw)
  );
}

function orbAnchor() {
  const orb = document.getElementById("ai-orb-button");
  if (!orb) return { x: window.innerWidth - 48, y: window.innerHeight - 48 };
  const box = orb.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function placePointer(el) {
  let pointer = document.getElementById(POINTER_ID);
  if (!pointer) {
    pointer = document.createElement("div");
    pointer.id = POINTER_ID;
    pointer.className = "ai-orb-pointer";
    pointer.setAttribute("aria-hidden", "true");
    document.body.appendChild(pointer);
  }

  const from = orbAnchor();
  const box = el.getBoundingClientRect();
  const to = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  pointer.style.left = `${from.x}px`;
  pointer.style.top = `${from.y}px`;
  pointer.style.width = `${Math.max(0, length - 28)}px`;
  pointer.style.transform = `rotate(${angle}deg)`;
  pointer.hidden = length < 40;
}

function detachPointer() {
  document.getElementById(POINTER_ID)?.remove();
}

export function clearHighlight() {
  if (clearTimer) {
    window.clearTimeout(clearTimer);
    clearTimer = 0;
  }
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }
  if (currentEl) {
    currentEl.classList.remove(HIGHLIGHT_CLASS);
    currentEl.removeAttribute("data-ai-highlighted");
    currentEl = null;
  }
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((node) => {
    node.classList.remove(HIGHLIGHT_CLASS);
    node.removeAttribute("data-ai-highlighted");
  });
  detachPointer();
}

/**
 * Outline a control without scrolling the page.
 * @param {string} selectorOrId CSS selector, element id, or data-ai-target value
 * @param {{ duration?: number, pointer?: boolean }} [options]
 */
export function highlightElement(selectorOrId, options = {}) {
  clearHighlight();
  const el = resolveTarget(selectorOrId);
  if (!el) return () => {};

  currentEl = el;
  el.classList.add(HIGHLIGHT_CLASS);
  el.setAttribute("data-ai-highlighted", "true");

  if (options.pointer !== false) {
    placePointer(el);
    resizeHandler = () => {
      if (currentEl) placePointer(currentEl);
    };
    window.addEventListener("resize", resizeHandler, { passive: true });
  }

  const ms = options.duration ?? 3200;
  if (ms > 0) {
    clearTimer = window.setTimeout(clearHighlight, ms);
  }
  return clearHighlight;
}

export function resolveAiTarget(selectorOrId) {
  return resolveTarget(selectorOrId);
}
