function averageLevel(data) {
  let sum = 0;
  const mid = Math.floor(data.length * 0.45);
  for (let i = 2; i < mid; i += 1) sum += data[i];
  return Math.min(1, sum / (mid * 180));
}

/**
 * Playback + Web Audio analyser. Analyser runs only while audio plays.
 * Never opens the microphone.
 */
export function createSpeechPlayer({ onLevel, onStart, onEnd } = {}) {
  let audio = null;
  let ctx = null;
  let analyser = null;
  let source = null;
  let raf = 0;
  let objectUrl = null;
  let fakeRaf = 0;
  let fakeUntil = 0;
  let settle = null;
  const bins = new Uint8Array(128);

  function finish() {
    emit(0);
    settle?.();
    settle = null;
    onEnd?.();
  }

  function waitUntilDone() {
    return new Promise((resolve) => {
      settle = resolve;
    });
  }

  function stopRaf() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (fakeRaf) cancelAnimationFrame(fakeRaf);
    fakeRaf = 0;
  }

  function emit(level) {
    onLevel?.(level);
  }

  function tickAnalyser() {
    if (!analyser) return;
    analyser.getByteFrequencyData(bins);
    emit(averageLevel(bins));
    raf = requestAnimationFrame(tickAnalyser);
  }

  function tickFake(now) {
    if (now >= fakeUntil) {
      fakeRaf = 0;
      finish();
      return;
    }
    const t = now / 1000;
    const level = 0.32 + 0.38 * Math.sin(t * 5.4) + 0.16 * Math.sin(t * 9.3);
    emit(Math.min(1, Math.max(0.08, level)));
    fakeRaf = requestAnimationFrame(tickFake);
  }

  function ensureGraph() {
    if (!audio) {
      audio = new Audio();
      audio.preload = "auto";
    }
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      ctx = new Ctor();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);
    }
    return true;
  }

  function revokeUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function stop() {
    stopRaf();
    fakeUntil = 0;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    revokeUrl();
    if (settle) {
      settle();
      settle = null;
    }
    emit(0);
  }

  function pulseFake(durationMs = 2200) {
    stop();
    onStart?.();
    fakeUntil = performance.now() + durationMs;
    const done = waitUntilDone();
    fakeRaf = requestAnimationFrame(tickFake);
    return done;
  }

  async function play(url, fallbackMs = 2200) {
    stop();
    if (!url || !ensureGraph()) {
      return pulseFake(fallbackMs);
    }
    try {
      if (ctx.state === "suspended") await ctx.resume();
      audio.src = url;
      const done = waitUntilDone();
      audio.onended = () => {
        stopRaf();
        finish();
      };
      audio.onerror = () => {
        stopRaf();
        finish();
      };
      onStart?.();
      await audio.play();
      raf = requestAnimationFrame(tickAnalyser);
      return done;
    } catch {
      return pulseFake(fallbackMs);
    }
  }

  function rememberObjectUrl(url) {
    revokeUrl();
    objectUrl = url;
    return url;
  }

  function destroy() {
    stop();
    if (ctx) {
      source?.disconnect();
      analyser?.disconnect();
      ctx.close().catch(() => {});
      ctx = null;
      analyser = null;
      source = null;
    }
    audio = null;
  }

  return { play, pulseFake, stop, destroy, rememberObjectUrl };
}
