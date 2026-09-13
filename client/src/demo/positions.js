/**
 * Named orb docks on the 16:9 stage (fractions of the framed stage box).
 *
 * Safe-zone rules:
 * - Park on the stage edge / margin, never in the inner copy box.
 * - Default walkthrough dock is bottom-right (`br`) with ~6–8% inset so the
 *   56px orb (48px on mobile) plus bubble stay off headlines, body, CTAs,
 *   tables, and scene titles.
 * - Speech bubbles open into empty space: above-left on `br`, above-right on `bl`.
 * - If a scene’s highlight or copy occupies the default corner, use the
 *   opposite edge (`bl` / `chat`). Never sit on highlighted text — point from the side.
 * - Chat panel docks bottom-left so it does not cover dashboard CTAs / stats.
 * - Offsets are resolved from the stage getBoundingClientRect (recording 16:9
 *   frame), not the full window. Centers are clamped inside that box.
 * - Narrow / short stages (mobile letterbox): park in the leftover window
 *   margin below the strip so the balloon stays off the scaled copy.
 */

const SAFE = {
  br: { x: 0.935, y: 0.91, dock: "br" },
  bl: { x: 0.075, y: 0.91, dock: "bl" },
  mr: { x: 0.955, y: 0.52, dock: "br" },
  ml: { x: 0.05, y: 0.52, dock: "bl" },
};

const NAMED = {
  br: SAFE.br,
  bl: SAFE.bl,
  mr: SAFE.mr,
  ml: SAFE.ml,
  chat: SAFE.bl,
  // Former mid-stage aliases — they sat on titles/cards. Keep names, park in the margin.
  hero: SAFE.br,
  mid: SAFE.br,
  how: SAFE.br,
  app: SAFE.br,
  cta: SAFE.br,
  center: SAFE.br,
};

function orbMetrics() {
  const mobile = typeof window !== "undefined" && window.innerWidth <= 640;
  return {
    size: mobile ? 48 : 56,
    pad: mobile ? 16 : 18,
  };
}

function inferDock(fx, fy) {
  const left = fx < 0.35;
  const top = fy < 0.35;
  if (left && top) return "tl";
  if (!left && top) return "tr";
  if (left) return "bl";
  return "br";
}

function defaultAnchor(dock = "br") {
  const { size, pad } = orbMetrics();
  const left = dock === "bl" || dock === "ml" || dock === "tl";
  const top = dock === "tl" || dock === "tr";
  return {
    x: left ? pad + size / 2 : window.innerWidth - pad - size / 2,
    y: top ? pad + size / 2 : window.innerHeight - pad - size / 2,
  };
}

function specFrom(position) {
  if (!position) return { ...SAFE.br };
  if (typeof position === "string") {
    return { ...(NAMED[position] || SAFE.br) };
  }
  if (typeof position === "object" && (position.x != null || position.y != null)) {
    const fx = position.x ?? SAFE.br.x;
    const fy = position.y ?? SAFE.br.y;
    if (Math.abs(fx) > 2 || Math.abs(fy) > 2) {
      return { x: fx, y: fy, dock: position.dock || "br", pixels: true };
    }
    return { x: fx, y: fy, dock: position.dock || inferDock(fx, fy) };
  }
  return { ...SAFE.br };
}

export function resolveOrbOffset(position, stageEl) {
  const spec = specFrom(position);
  if (spec.pixels) {
    return { x: spec.x || 0, y: spec.y || 0, dock: spec.dock || "br" };
  }
  return fromFractions(spec.x, spec.y, stageEl, spec.dock);
}

export function resolveOrbDock(position) {
  return specFrom(position).dock || "br";
}

function fromFractions(fx, fy, stageEl, dock = "br") {
  const { size, pad } = orbMetrics();
  const from = defaultAnchor(dock);
  const box = stageEl?.getBoundingClientRect();
  const left = dock === "bl" || dock === "ml" || dock === "tl";
  let toX;
  let toY;
  if (box && box.width > 0 && box.height > 0) {
    toX = box.left + box.width * fx;
    toY = box.top + box.height * fy;
    const compact = box.height < 480 || window.innerWidth <= 640;
    if (compact) {
      // Letterboxed phones: keep the orb in the empty window band so the
      // balloon is not stamped on the scaled-down title.
      toX = left
        ? Math.max(pad + size / 2, box.left + pad + size / 2)
        : Math.min(window.innerWidth - pad - size / 2, box.right - pad - size / 2);
      toY = window.innerHeight - pad - size / 2;
    } else {
      const minX = box.left + pad + size / 2;
      const maxX = box.right - pad - size / 2;
      const minY = box.top + pad + size / 2;
      const maxY = box.bottom - pad - size / 2;
      toX = Math.min(maxX, Math.max(minX, toX));
      toY = Math.min(maxY, Math.max(minY, toY));
    }
  } else {
    toX = window.innerWidth * fx;
    toY = window.innerHeight * fy;
  }
  toX = Math.min(window.innerWidth - pad - size / 2, Math.max(pad + size / 2, toX));
  toY = Math.min(window.innerHeight - pad - size / 2, Math.max(pad + size / 2, toY));
  return {
    x: Math.round(toX - from.x),
    y: Math.round(toY - from.y),
    dock,
  };
}
