import { memo } from "react";

function OrbVisualizer({ state = "idle", level = 0 }) {
  const speaking = state === "speaking";
  const thinking = state === "thinking";
  const glow = speaking ? 0.34 + level * 0.55 : thinking ? 0.42 : 0.28;

  return (
    <svg className="ai-orb-visual" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="ai-orb-core" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#dce7ff" stopOpacity="0.95" />
          <stop offset="38%" stopColor="#6ba0ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0a101c" stopOpacity="0.96" />
        </radialGradient>
        <radialGradient id="ai-orb-sheen" cx="30%" cy="24%" r="46%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        className="ai-orb-halo"
        cx="32"
        cy="32"
        r="29"
        fill="none"
        stroke="rgba(138,180,255,0.35)"
        strokeWidth="0.6"
        style={{ opacity: glow }}
      />
      <circle cx="32" cy="32" r="24" fill="url(#ai-orb-core)" />
      <circle cx="32" cy="32" r="24" fill="url(#ai-orb-sheen)" />
      <g className={thinking ? "ai-orb-orbit is-spinning" : "ai-orb-orbit"}>
        <circle cx="32" cy="32" r="18.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" strokeDasharray="3 7" />
        <circle cx="49.5" cy="24" r="1.15" fill="#cfe0ff" />
      </g>
      <circle
        className="ai-orb-iris"
        cx="32"
        cy="33"
        r={speaking ? 4.2 + level * 3.4 : 5}
        fill="#eef4ff"
        opacity={speaking ? 0.55 + level * 0.4 : 0.42}
      />
      <path
        d="M32 21.5l0.7 2.1h2.2l-1.8 1.3 0.7 2.1L32 25.7l-1.8 1.3 0.7-2.1-1.8-1.3h2.2z"
        fill="#fff"
        opacity="0.7"
      />
    </svg>
  );
}

export default memo(OrbVisualizer);
