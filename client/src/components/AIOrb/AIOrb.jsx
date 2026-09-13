import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "../../i18n/LanguageContext.jsx";
import { assistantContext, stripHighlightHint } from "./assistantContext.js";
import { askAssistant } from "./assistantApi.js";
import { createDemoController, demoRequested } from "./DemoController.js";
import { demoScript } from "./demoScript.js";
import { clearHighlight, highlightElement } from "./highlight.js";
import { setOrbBridge } from "./orbBridge.js";
import { createSpeechPlayer } from "./tts/audio.js";
import { synthesizeSpeech } from "./tts/ttsClient.js";
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

function speakBrowser(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = document.documentElement.lang || "en";
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
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
  const playerRef = useRef(null);
  const demoRef = useRef(null);
  const chatOpenRef = useRef(false);
  const scriptedRef = useRef(false);
  const sendingRef = useRef(false);

  chatOpenRef.current = chatOpen;
  scriptedRef.current = scripted;

  const player = useMemo(() => {
    const instance = createSpeechPlayer({
      onLevel: (value) => setLevel(value),
      onEnd: () => {
        setLevel(0);
        setOrbState((prev) => (prev === "speaking" ? (chatOpenRef.current ? "open" : "idle") : prev));
      },
    });
    playerRef.current = instance;
    return instance;
  }, []);

  const stopSpeech = useCallback(() => {
    player.stop();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setLevel(0);
  }, [player]);

  const speak = useCallback(
    async (text, duration, options = {}) => {
      const clean = String(text || "").trim();
      if (!clean) return "empty";
      setBubble(clean);
      if (reduced.current) {
        setOrbState("speaking");
        await new Promise((resolve) => setTimeout(resolve, Math.min(duration || 1800, 1600)));
        setOrbState(chatOpenRef.current ? "open" : "idle");
        return "reduced";
      }
      setOrbState("speaking");
      const fallbackMs = duration || Math.min(4000, 900 + clean.length * 28);
      const url = await synthesizeSpeech(clean);
      if (url) {
        player.rememberObjectUrl(url);
        await player.play(url, fallbackMs);
        return "tts";
      }
      if (options.allowBrowser) speakBrowser(clean);
      await player.pulseFake(fallbackMs);
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      return options.allowBrowser ? "browser" : "fake";
    },
    [player]
  );

  const speakAudio = useCallback(
    async (url, duration, text) => {
      const clean = String(text || "").trim();
      if (clean) setBubble(clean);
      setOrbState("speaking");
      if (reduced.current) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(duration || 1800, 1600)));
        setOrbState(chatOpenRef.current ? "open" : "idle");
        return;
      }
      await player.play(url, duration || 2200);
    },
    [player]
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
      pulse: (ms) => player.pulseFake(ms),
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
  }, [applyHighlight, onDemo, player, speak, speakAudio, stopSpeech]);

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
      player.destroy();
      clearHighlight();
    },
    [player]
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
        {bubble && !chatOpen ? (
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
