import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getOrbBridge, whenOrbReady } from "../components/AIOrb/orbBridge.js";
import { Logo } from "../components/ui/Logo.jsx";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher.jsx";
import { useI18n } from "../i18n/LanguageContext.jsx";
import { DemoStage } from "./DemoStage.jsx";
import { CaptureButton, RecordingMode, recordingRequested } from "./RecordingMode.jsx";
import { scenes } from "./scenes.js";
import { createSceneRunner } from "./sceneRunner.js";
import "./demo.css";

const CANVAS = { w: 1280, h: 720 };

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function DemoPlayer({ autoRecord = false }) {
  const { t } = useI18n();
  const queryRecord = autoRecord || recordingRequested();
  const [recording, setRecording] = useState(queryRecord);
  const [started, setStarted] = useState(queryRecord);
  const [done, setDone] = useState(false);
  const [scene, setScene] = useState(scenes[0]);
  const [ui, setUi] = useState({});
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const runnerRef = useRef(null);
  const rafRef = useRef(0);

  const resetUi = useCallback(() => {
    setUi({});
    setScene(scenes[0]);
    setProgress(0);
    setDone(false);
  }, []);

  const stop = useCallback(() => {
    runnerRef.current?.stop();
    runnerRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }, []);

  const startRef = useRef(null);

  const start = useCallback(async (opts = {}) => {
    const rec = Boolean(opts.recording ?? recording);
    if (opts.recording) setRecording(true);
    stop();
    resetUi();
    setStarted(true);
    setDone(false);
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const orb = await whenOrbReady();
    orb.setRecording(rec);
    orb.setScripted(true);
    orb.setVisible(true);
    orb.setMessages([]);
    orb.setChatOpen(false);
    orb.clearHighlight();
    orb.stopSpeech();

    const runner = createSceneRunner({
      orb,
      stageEl: () => stageRef.current,
      onScene: (next) => {
        setScene(next);
        if (next.transition === "fade" && prefersReducedMotion()) {
          /* keep instant */
        }
      },
      onBeat: (patch) => setUi((prev) => ({ ...prev, ...patch })),
      onAction: () => {},
      onProgress: setProgress,
      onDone: () => {
        setDone(true);
        setProgress(1);
        orb.setScripted(true);
        orb.setOrbState("idle");
      },
    });
    runnerRef.current = runner;

    const begun = performance.now();
    const total = scenes.reduce((sum, item) => sum + item.duration, 0);
    const tick = (now) => {
      setProgress(Math.min(1, (now - begun) / total));
      if (now - begun < total) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    await runner.run(scenes);
  }, [recording, resetUi, stop]);

  startRef.current = start;

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return undefined;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(node.clientWidth / CANVAS.w, node.clientHeight / CANVAS.h));
    });
    ro.observe(node);
    setScale(Math.min(node.clientWidth / CANVAS.w, node.clientHeight / CANVAS.h) || 1);
    return () => ro.disconnect();
  }, [started]);

  useEffect(() => {
    if (!queryRecord) return undefined;
    const id = window.setTimeout(() => startRef.current?.(), 450);
    return () => window.clearTimeout(id);
  }, [queryRecord]);

  useEffect(
    () => () => {
      stop();
      const orb = getOrbBridge();
      if (!orb) return;
      orb.setScripted(false);
      orb.setRecording(false);
      orb.setVisible(true);
      orb.setOffset({ x: 0, y: 0 });
    },
    [stop]
  );

  function toggleRecording(next) {
    setRecording(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("record", "1");
    else url.searchParams.delete("record");
    window.history.replaceState({}, "", url);
  }

  if (!started) {
    return (
      <div className="demo-page demo-start">
        <div className="demo-start-card">
          <Logo to="/" variant="wordmark" />
          <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-zinc-500">{t("demo.kicker")}</p>
          <h1 className="display mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("demo.title")}</h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-400">{t("demo.subtitle")}</p>
          <button type="button" className="btn-cta mt-8" onClick={start}>
            {t("demo.start")}
          </button>
          <p className="mt-4 text-sm text-zinc-500">{t("demo.hint")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <RecordingMode recording={recording} onToggle={toggleRecording} />
            <CaptureButton onStartDemo={() => start({ recording: true })} />
            <LanguageSwitcher />
          </div>
          <p className="mx-auto mt-4 max-w-md text-xs text-zinc-600">{t("demo.recordingHelp")}</p>
          <Link to="/" className="mt-8 inline-block text-sm text-zinc-500 hover:text-white">
            {t("demo.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`demo-page${recording ? " is-recording" : ""}`} data-demo-state={done ? "done" : "playing"}>
      {recording ? null : (
        <div className="demo-chrome">
          <div className="flex items-center gap-3">
            <Logo to="/" variant="mark" />
            <span className="text-sm text-zinc-500">{t("demo.kicker")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RecordingMode recording={recording} onToggle={toggleRecording} disabled />
            {done ? (
              <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={start}>
                {t("demo.replay")}
              </button>
            ) : (
              <button type="button" className="btn-ghost px-3 py-2 text-sm" onClick={stop}>
                {t("common.cancel")}
              </button>
            )}
            <Link to="/signup" className="btn-primary px-4 py-2 text-sm">
              {t("common.getStarted")}
            </Link>
          </div>
        </div>
      )}
      {recording ? null : (
        <div className="demo-progress" aria-hidden="true">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
      <div className="demo-stage-wrap">
        <div ref={stageRef} className="demo-stage" data-ai-target="demo-stage">
          <DemoStage scene={scene} ui={ui} scale={scale || 1} canvasRef={canvasRef} />
          {recording ? <div className="demo-lock" aria-hidden="true" /> : null}
        </div>
      </div>
      {recording || !done ? null : (
        <p className="px-4 py-4 text-center text-sm text-zinc-500">{t("demo.ended")}</p>
      )}
    </div>
  );
}

export default function DemoPage() {
  return <DemoPlayer autoRecord={recordingRequested()} />;
}
