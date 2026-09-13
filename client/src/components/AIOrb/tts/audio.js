/**
 * Timing helper only. No Audio element, no Web Audio analyser, no microphone.
 * Kept so older callers can wait on a speaking pulse without playing sound.
 */
export function createSpeechPlayer({ onLevel, onStart, onEnd } = {}) {
  let timer = 0;

  function stop() {
    if (timer) window.clearTimeout(timer);
    timer = 0;
    onLevel?.(0);
  }

  function pulseFake(durationMs = 2200) {
    stop();
    onStart?.();
    onLevel?.(0.22);
    return new Promise((resolve) => {
      timer = window.setTimeout(() => {
        timer = 0;
        onLevel?.(0);
        onEnd?.();
        resolve();
      }, Math.max(0, durationMs));
    });
  }

  return {
    play: (_url, fallbackMs) => pulseFake(fallbackMs),
    pulseFake,
    stop,
    destroy: stop,
    rememberObjectUrl: (url) => url,
  };
}
