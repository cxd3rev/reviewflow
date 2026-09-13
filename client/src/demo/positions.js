/** Named orb positions, resolved from the 16:9 stage box to AIOrb translate offsets. */

const NAMED = {
  br: { x: 0.92, y: 0.86 },
  bl: { x: 0.1, y: 0.86 },
  center: { x: 0.5, y: 0.55 },
  hero: { x: 0.3, y: 0.62 },
  mid: { x: 0.78, y: 0.42 },
  how: { x: 0.88, y: 0.38 },
  app: { x: 0.9, y: 0.78 },
  cta: { x: 0.68, y: 0.62 },
};

function defaultAnchor() {
  const pad = 24;
  const size = 56;
  return {
    x: window.innerWidth - pad - size / 2,
    y: window.innerHeight - pad - size / 2,
  };
}

export function resolveOrbOffset(position, stageEl) {
  if (!position) return { x: 0, y: 0 };
  if (typeof position === "object" && (position.x != null || position.y != null) && position.x <= 2 && position.y <= 2) {
    return fromFractions(position.x ?? 0.92, position.y ?? 0.86, stageEl);
  }
  if (typeof position === "object" && (Math.abs(position.x) > 2 || Math.abs(position.y) > 2)) {
    return { x: position.x || 0, y: position.y || 0 };
  }
  const named = NAMED[position] || NAMED.br;
  return fromFractions(named.x, named.y, stageEl);
}

function fromFractions(fx, fy, stageEl) {
  const box = stageEl?.getBoundingClientRect();
  const from = defaultAnchor();
  const to = box
    ? { x: box.left + box.width * fx, y: box.top + box.height * fy }
    : { x: window.innerWidth * fx, y: window.innerHeight * fy };
  return { x: Math.round(to.x - from.x), y: Math.round(to.y - from.y) };
}
