/** TTS is disabled. The orb speaks with text balloons only. */
export async function synthesizeSpeech() {
  return null;
}

export async function requestTtsMeta() {
  return { fallback: true, audioUrl: null };
}
