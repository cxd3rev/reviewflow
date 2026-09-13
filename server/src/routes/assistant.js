import express from "express";
import { buildSystemPrompt, matchAssistantReply, stripHighlightHint } from "../../../client/src/components/AIOrb/assistantContext.js";
import { trim } from "../utils/validation.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";

function assistantKey() {
  return trim(process.env.OPENAI_API_KEY || process.env.ASSISTANT_API_KEY);
}

function ttsKey() {
  return trim(process.env.TTS_API_KEY || process.env.OPENAI_API_KEY || process.env.ASSISTANT_API_KEY);
}

async function completeWithOpenAI({ message, locale, history }) {
  const key = assistantKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          { role: "system", content: buildSystemPrompt(locale) },
          ...history,
          { role: "user", content: message },
        ],
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || "Assistant request failed.");
    }
    return trim(data.choices?.[0]?.message?.content);
  } finally {
    clearTimeout(timer);
  }
}

export function assistantRoutes() {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const message = trim(req.body?.message).slice(0, 500);
    const locale = trim(req.body?.locale || "en").slice(0, 8) || "en";
    const history = Array.isArray(req.body?.history)
      ? req.body.history
          .slice(-6)
          .map((item) => ({
            role: item?.role === "assistant" ? "assistant" : "user",
            content: trim(item?.content || item?.text).slice(0, 500),
          }))
          .filter((item) => item.content)
      : [];

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!assistantKey()) {
      const local = matchAssistantReply(message);
      return res.json({
        reply: local.reply,
        highlight: local.highlight,
        source: "fallback",
      });
    }

    try {
      const raw = await completeWithOpenAI({ message, locale, history });
      const parsed = stripHighlightHint(raw);
      return res.json({
        reply: parsed.reply || raw,
        highlight: parsed.highlight || null,
        source: "openai",
      });
    } catch (err) {
      console.error("[assistant]", err.message);
      const local = matchAssistantReply(message);
      return res.json({
        reply: local.reply,
        highlight: local.highlight,
        source: "fallback",
      });
    }
  });

  // Placeholder: returns audio/mpeg when a key exists, otherwise { fallback: true }.
  router.post("/tts", async (req, res) => {
    const text = trim(req.body?.text).slice(0, 400);
    const key = ttsKey();
    if (!text) return res.status(400).json({ error: "Text is required." });
    if (!key) return res.json({ fallback: true, audioUrl: null });

    try {
      const response = await fetch(OPENAI_TTS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.TTS_MODEL || "tts-1",
          voice: process.env.TTS_VOICE || "nova",
          input: text,
        }),
      });
      if (!response.ok) {
        return res.json({ fallback: true, audioUrl: null });
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      res.setHeader("Content-Type", "audio/mpeg");
      return res.send(buffer);
    } catch (err) {
      console.error("[assistant:tts]", err.message);
      return res.json({ fallback: true, audioUrl: null });
    }
  });

  return router;
}
