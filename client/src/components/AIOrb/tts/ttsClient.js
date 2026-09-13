import { api } from "../../../lib/api.js";

/**
 * Frontend TTS abstraction: text → backend (or none) → object URL.
 * When no TTS key exists the server returns { fallback: true }.
 */
export async function synthesizeSpeech(text) {
  const value = String(text || "").trim();
  if (!value) return null;

  try {
    const response = await fetch(`${String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/assistant/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value.slice(0, 400) }),
    });

    const type = response.headers.get("content-type") || "";
    if (response.ok && type.includes("audio")) {
      return URL.createObjectURL(await response.blob());
    }

    if (type.includes("json")) {
      await response.json().catch(() => ({}));
    }
    return null;
  } catch {
    return null;
  }
}

/** Optional JSON helper if a later TTS provider returns a URL instead of bytes. */
export async function requestTtsMeta(text) {
  try {
    return await api("/api/assistant/tts", {
      method: "POST",
      body: JSON.stringify({ text, format: "json" }),
    });
  } catch {
    return { fallback: true, audioUrl: null };
  }
}
