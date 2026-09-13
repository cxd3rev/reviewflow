import { demoAudioUrl, mediaExists } from "./assets.js";

let utterance = null;

function cancelBrowserSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  utterance = null;
}

function speakBrowser(text) {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) return false;
  cancelBrowserSpeech();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = document.documentElement.lang || "en";
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Audio file → existing TTS → speechSynthesis + fake envelope → fake envelope.
 * Always drives the shared speech player so --orb-level still pulses.
 */
export async function playNarration(orb, { text, audio, duration }) {
  const clean = String(text || "").trim();
  const fallbackMs = duration || Math.min(8000, 900 + clean.length * 28);
  if (!clean && !audio) return;

  if (audio) {
    const url = demoAudioUrl(audio);
    if (await mediaExists(url)) {
      await orb.speakAudio(url, fallbackMs, clean);
      return;
    }
  }

  if (clean && orb.speak) {
    const usedTts = await orb.speak(clean, fallbackMs, { allowBrowser: true });
    if (usedTts !== "empty") return;
  }

  if (clean) speakBrowser(clean);
  await orb.pulse?.(fallbackMs);
  cancelBrowserSpeech();
}

export { cancelBrowserSpeech };
