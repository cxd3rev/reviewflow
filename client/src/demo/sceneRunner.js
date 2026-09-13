import { resolveAiTarget } from "../components/AIOrb/highlight.js";
import { resolveOrbOffset } from "./positions.js";
import { playNarration, cancelBrowserSpeech } from "./speech.js";

export function createSceneRunner({ orb, stageEl, onScene, onBeat, onProgress, onDone, onAction }) {
  let cancelled = false;
  const timers = new Set();

  function wait(ms) {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        resolve();
      }, Math.max(0, ms || 0));
      timers.add(id);
    });
  }

  function applyPosition(position) {
    orb.setOffset(resolveOrbOffset(position, stageEl?.()));
  }

  async function runAction(action) {
    if (!action) return;
    if (action.type === "appear") {
      orb.setVisible(true);
      return;
    }
    if (action.type === "click") {
      if (action.target === "orb") return;
      resolveAiTarget(action.target)?.click();
      return;
    }
    onAction?.(action);
  }

  async function run(scenes) {
    cancelled = false;
    orb.onStart?.();
    orb.setScripted(true);
    orb.setVisible(true);
    orb.setChatOpen(false);
    orb.setMessages?.([]);

    const demoStarted = performance.now();

    for (const scene of scenes) {
      if (cancelled) break;
      const sceneStarted = performance.now();
      onScene?.(scene);
      applyPosition(scene.orbPosition);
      await wait(80);

      if (scene.action) await runAction(scene.action);
      if (cancelled) break;

      const beats = scene.beats || [];
      beats.forEach((beat) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          if (cancelled) return;
          if (beat.ui) onBeat?.(beat.ui);
          if (beat.chat === "open") orb.setChatOpen(true);
          if (beat.chat === "close") {
            orb.setChatOpen(false);
            orb.setBubble("");
          }
          if (beat.state) orb.setOrbState(beat.state);
          if (beat.message) orb.addMessage({
            id: `demo-${scene.id}-${beat.message.role}`,
            role: beat.message.role,
            text: beat.message.text,
          });
          if (beat.highlight) {
            orb.highlight(beat.highlight.target, {
              duration: beat.highlight.duration ?? 2400,
              pointer: beat.highlight.pointer !== false,
            });
          }
        }, beat.at);
        timers.add(id);
      });

      if (scene.highlight && scene.highlightAt != null) {
        const hid = window.setTimeout(() => {
          timers.delete(hid);
          if (cancelled) return;
          orb.highlight(scene.highlight.target || scene.targetElement, {
            duration: scene.highlight.duration ?? 2400,
            pointer: scene.highlight.pointer !== false,
          });
        }, scene.highlightAt);
        timers.add(hid);
      } else if (scene.highlight) {
        orb.highlight(scene.highlight.target || scene.targetElement, {
          duration: scene.highlight.duration ?? 2400,
          pointer: scene.highlight.pointer !== false,
        });
      }

      if (scene.narration) {
        try {
          await playNarration(orb, {
            text: scene.narration,
            duration: scene.speechMs,
          });
        } catch {
          orb.setBubble?.(scene.narration);
          await orb.pulse?.(scene.speechMs || 1800);
        }
      }
      if (cancelled) break;
      if (scene.waitAfterSpeech) await wait(scene.waitAfterSpeech);

      const used = performance.now() - sceneStarted;
      if (used < scene.duration) await wait(scene.duration - used);
      onProgress?.(Math.min(1, (performance.now() - demoStarted) / scenes.reduce((sum, item) => sum + item.duration, 0)));
    }

    cancelBrowserSpeech();
    if (!cancelled) {
      orb.setOrbState(orb.isChatOpen?.() ? "open" : "idle");
      onDone?.();
    }
    orb.onEnd?.();
  }

  function stop() {
    cancelled = true;
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    cancelBrowserSpeech();
    orb.stopSpeech?.();
    orb.clearHighlight?.();
    orb.setBubble("");
    orb.setChatOpen(false);
    orb.setOffset({ x: 0, y: 0 });
    orb.setOrbState("idle");
    orb.onEnd?.();
  }

  return { run, stop };
}
