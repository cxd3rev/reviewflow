import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n/LanguageContext.jsx";

export function recordingRequested() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("record") === "1";
}

export function RecordingMode({ recording, onToggle, disabled }) {
  const { t } = useI18n();
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      <input
        type="checkbox"
        checked={recording}
        disabled={disabled}
        onChange={(event) => onToggle(event.target.checked)}
      />
      {t("demo.recording")}
    </label>
  );
}

function pickMime() {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return types.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) || "";
}

export function CaptureButton({ onStartDemo }) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(
    () => () => {
      recRef.current?.stop();
    },
    []
  );

  async function start() {
    if (!navigator.mediaDevices?.getDisplayMedia) return;
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30, displaySurface: "browser" },
      audio: false,
      preferCurrentTab: true,
    });
    const mime = pickMime();
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "starywrld-demo.webm";
      a.click();
      URL.revokeObjectURL(url);
      setActive(false);
      recRef.current = null;
    };
    recRef.current = recorder;
    recorder.start();
    setActive(true);
    onStartDemo?.();
  }

  function stop() {
    recRef.current?.stop();
  }

  return (
    <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={active ? stop : start}>
      {active ? t("demo.stopCapture") : t("demo.recordThis")}
    </button>
  );
}
