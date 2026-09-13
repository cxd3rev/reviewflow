import express from "express";
import { buildSystemPrompt, matchAssistantReply, stripHighlightHint } from "../../../client/src/components/AIOrb/assistantContext.js";
import { trim } from "../utils/validation.js";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function assistantKey() {
  return trim(process.env.OPENAI_API_KEY || process.env.ASSISTANT_API_KEY);
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

  // Voice is disabled — the orb uses text balloons only.
  router.post("/tts", (_req, res) => {
    return res.json({ fallback: true, audioUrl: null });
  });

  return router;
}
