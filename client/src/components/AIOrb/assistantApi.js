import { api } from "../../lib/api.js";
import { matchAssistantReply } from "./assistantContext.js";

export async function askAssistant(message, { locale = "en", history = [] } = {}) {
  const text = String(message || "").trim();
  if (!text) return matchAssistantReply("");

  try {
    const data = await api("/api/assistant", {
      method: "POST",
      body: JSON.stringify({
        message: text.slice(0, 500),
        locale,
        history: history.slice(-6).map((item) => ({
          role: item.role === "assistant" ? "assistant" : "user",
          content: String(item.content || item.text || "").slice(0, 500),
        })),
      }),
    });
    if (data?.reply) {
      return {
        reply: data.reply,
        highlight: data.highlight || null,
        source: data.source || "api",
      };
    }
  } catch {
    /* server down or unconfigured — local FAQ fallback */
  }

  return matchAssistantReply(text);
}
