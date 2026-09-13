import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../i18n/LanguageContext.jsx";
import { assistantContext, stripHighlightHint } from "./assistantContext.js";
import { askAssistant } from "./assistantApi.js";
import { createDemoController, demoRequested } from "./DemoController.js";
import { demoScript } from "./demoScript.js";
import { clearHighlight, highlightElement } from "./highlight.js";
import { setOrbBridge } from "./orbBridge.js";
import AIChat from "./AIChat.jsx";
import OrbVisualizer from "./OrbVisualizer.jsx";
import "./AIOrb.css";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nextId() {
  return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isDemoPath(pathname) {
  return pathname === "/demo" || pathname.endsWith("/demo");
}

function readingTimeMs(text, duration) {
  if (Number.isFinite(duration) && duration > 0) return duration;
  const clean = String(text || "").trim();
  if (!clean) return 0;
  return Math.min(8000, Math.max(1200, 900 + clean.length * 28));
}

export function AIOrb() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const onDemo = isDemoPath(location.pathname);
  const [chatOpen, setChatOpen] = useState(false);
  const [orbState, setOrbState] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [bubble, setBubble] = useState("");
  const [level, setLevel] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [offline, setOffline] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [scripted, setScripted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [visible, setVisible] = useState(!onDemo);
  const reduced = useRef(prefersReducedMotion());
  const demoRef = useRef(null);
  const chatOpenRef = useRef(false);
  const scriptedRef = useRef(false);
  const sendingRef = useRef(false);
  const speakGenRef = useRef(0);
  const speakTimerRef = useRef(0);
  const speakResolveRef = useRef(null);

  chatOpenRef.current = chatOpen;
  scriptedRef.current = scripted;

  const waitMs = useCallback((ms) => {
    return new Promise((resolve) => {
      if (speakTimerRef.current) window.clearTimeout(speakTimerRef.current);
      speakResolveRef.current?.();
      speakResolveRef.current = resolve;
      speakTimerRef.current = window.setTimeout(() => {
        speakTimerRef.current = 0;
        speakResolveRef.current = null;
        resolve();
      }, Math.max(0, ms || 0));
    });
  }, []);

  const stopSpeech = useCallback(() => {
    speakGenRef.current += 1;
    if (speakTimerRef.current) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = 0;
    }
    speakResolveRef.current?.();
    speakResolveRef.current = null;
    setLevel(0);
  }, []);

  const speak = useCallback(
    async (text, duration) => {
      const clean = String(text || "").trim();
      if (!clean) return "empty";
      const gen = (speakGenRef.current += 1);
      setBubble(clean);
      setOrbState("speaking");
      setLevel(0.22);
      const hold = reduced.current
        ? Math.min(duration || 1800, 1600)
        : readingTimeMs(clean, duration);
      await waitMs(hold);
      if (gen !== speakGenRef.current) return "stopped";
      setLevel(0);
      setOrbState((prev) => (prev === "speaking" ? (chatOpenRef.current ? "open" : "idle") : prev));
      return "text";
    },
    [waitMs]
  );

  const speakAudio = useCallback(
    async (_url, duration, text) => speak(text, duration),
    [speak]
  );

  const pulse = useCallback(
    async (ms) => {
      const gen = (speakGenRef.current += 1);
      setOrbState("speaking");
      setLevel(0.22);
      await waitMs(ms || 1800);
      if (gen !== speakGenRef.current) return;
      setLevel(0);
      setOrbState((prev) => (prev === "speaking" ? (chatOpenRef.current ? "open" : "idle") : prev));
    },
    [waitMs]
  );

  const applyHighlight = useCallback((target, options) => {
    if (!target) return;
    const mapped = assistantContext.ui[target]?.selector || target;
    highlightElement(mapped, options);
  }, []);

  useEffect(() => {
    const controller = createDemoController({
      setVisible,
      setOffset,
      setOrbState,
      setChatOpen,
      setBubble,
      isChatOpen: () => chatOpenRef.current,
      highlight: applyHighlight,
      clearHighlight,
      addMessage: (item) => setMessages((prev) => [...prev, item]),
      speak,
      stopSpeech,
      onStart: () => setDemoActive(true),
      onEnd: () => {
        if (!scriptedRef.current) setDemoActive(false);
      },
    });
    demoRef.current = controller;

    const bridge = {
      setVisible,
      setOffset,
      setOrbState,
      setChatOpen,
      setBubble,
      setMessages: (items) => setMessages(Array.isArray(items) ? items : []),
      setScripted: (value) => {
        setScripted(Boolean(value));
        setDemoActive(Boolean(value));
      },
      setRecording: (value) => setRecording(Boolean(value)),
      isChatOpen: () => chatOpenRef.current,
      highlight: applyHighlight,
      clearHighlight,
      addMessage: (item) => setMessages((prev) => [...prev, item]),
      speak,
      speakAudio,
      pulse,
      stopSpeech,
      onStart: () => setDemoActive(true),
      onEnd: () => {
        if (!scriptedRef.current) setDemoActive(false);
      },
    };
    setOrbBridge(bridge);

    const helpers = {
      startDemo: () => controller.run(demoScript),
      stopDemo: () => controller.stop(),
      highlight: applyHighlight,
      ask: (text) => setInput(String(text || "")),
      context: assistantContext,
    };
    window.starywrldAssistant = helpers;

    let startTimer = 0;
    if (demoRequested() && !onDemo) {
      startTimer = window.setTimeout(() => controller.run(demoScript), 700);
    }

    return () => {
      window.clearTimeout(startTimer);
      controller.stop();
      setOrbBridge(null);
      if (window.starywrldAssistant === helpers) delete window.starywrldAssistant;
    };
  }, [applyHighlight, onDemo, pulse, speak, speakAudio, stopSpeech]);

  useEffect(() => {
    if (onDemo && !scripted) setVisible(false);
    if (!onDemo) {
      setVisible(true);
      setScripted(false);
      setRecording(false);
    }
  }, [onDemo, scripted]);

  useEffect(() => {
    function onKey(event) {
      if (scriptedRef.current) return;
      if (event.key === "Escape" && chatOpenRef.current) {
        setChatOpen(false);
        setOrbState("idle");
        setBubble("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      stopSpeech();
      clearHighlight();
    },
    [stopSpeech]
  );

  const toggleChat = useCallback(() => {
    if (scriptedRef.current) return;
    demoRef.current?.stop();
    setChatOpen((open) => {
      const next = !open;
      setOrbState(next ? "open" : "idle");
      if (!next) {
        stopSpeech();
        setBubble("");
        clearHighlight();
      }
      return next;
    });
  }, [stopSpeech]);

  const send = useCallback(async () => {
    if (scriptedRef.current) return;
    const text = input.trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    demoRef.current?.stop();
    setInput("");
    const userMsg = { id: nextId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setChatOpen(true);
    setOrbState("thinking");
    setBubble("");

    const data = await askAssistant(text, {
      locale: lang,
      history: [...messages, userMsg],
    });
    const parsed = stripHighlightHint(data.reply);
    const reply = parsed.reply || data.reply;
    setOffline(data.source === "fallback");
    setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: reply }]);
    const target = parsed.highlight || data.highlight;
    if (target) applyHighlight(target, { duration: 3600, pointer: true });
    await speak(reply);
    sendingRef.current = false;
  }, [applyHighlight, input, lang, messages, speak]);

  const visualState = chatOpen && orbState === "idle" ? "open" : orbState;
  const showTip = !chatOpen && !bubble && !demoActive && !scripted && !onDemo;
  const hidden = !visible || (onDemo && !scripted && !demoActive);
  const rootClass = [
    "ai-orb-root",
    scripted ? "is-scripted" : "",
    recording ? "is-recording" : "",
    hidden ? "is-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const rootStyle = {
    transform: offset.x || offset.y ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
    "--orb-level": String(level),
  };

  return (
    <div className={rootClass} style={rootStyle} aria-hidden={hidden || undefined}>
      {chatOpen ? (
        <AIChat
          t={t}
          messages={messages}
          input={input}
          onInput={setInput}
          onSend={send}
          onClose={toggleChat}
          thinking={orbState === "thinking"}
          offline={offline}
        />
      ) : null}

      <div className="ai-orb-stage">
        {bubble ? (
          <div className="ai-orb-bubble" aria-live="polite">
            {bubble}
          </div>
        ) : null}
        <button
          id="ai-orb-button"
          type="button"
          className={`ai-orb-btn is-${visualState}`}
          aria-label={chatOpen ? t("orb.close") : t("orb.open")}
          aria-expanded={chatOpen}
          aria-controls={chatOpen ? "ai-orb-input" : undefined}
          tabIndex={scripted || hidden ? -1 : 0}
          onClick={toggleChat}
        >
          {showTip ? <span className="ai-orb-tip">{t("orb.ask")}</span> : null}
          <OrbVisualizer state={visualState} level={level} />
        </button>
      </div>
    </div>
  );
}
