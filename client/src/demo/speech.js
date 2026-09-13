/** Estimate how long a balloon should stay visible. Scene speechMs wins when set. */
export function readingTimeMs(text, duration) {
  if (Number.isFinite(duration) && duration > 0) return duration;
  const clean = String(text || "").trim();
  if (!clean) return 0;
  return Math.min(8000, Math.max(1200, 900 + clean.length * 28));
}

/**
 * Show narration as a speech bubble only. No audio files, TTS, or speechSynthesis.
 */
export async function playNarration(orb, { text, duration }) {
  const clean = String(text || "").trim();
  if (!clean) return;
  const ms = readingTimeMs(clean, duration);
  if (orb.speak) {
    await orb.speak(clean, ms);
    return;
  }
  orb.setBubble?.(clean);
  orb.setOrbState?.("speaking");
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

/** Voice is disabled — kept so the scene runner can still call stop. */
export function cancelBrowserSpeech() {}
