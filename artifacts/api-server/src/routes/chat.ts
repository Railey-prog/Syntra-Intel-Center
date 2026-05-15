import { Router, type IRouter } from "express";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";

const OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct:free";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit");
}

async function callLLM(
  messages: { role: string; content: string }[],
  base: string,
  model: string,
  apiKey: string,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const res = await fetch(base, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 700,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message ?? "Unknown error");

  return data.choices?.[0]?.message?.content ?? "";
}

async function callWithFallback(
  messages: { role: string; content: string }[],
  log: (provider: string) => void,
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (groqKey) {
    try {
      const reply = await callLLM(messages, GROQ_BASE, GROQ_MODEL, groqKey);
      log("groq");
      return reply;
    } catch (err) {
      if (!isRateLimitError(err)) throw err;
      // Groq rate-limited — fall through to OpenRouter
    }
  }

  if (openrouterKey) {
    const reply = await callLLM(
      messages,
      OPENROUTER_BASE,
      OPENROUTER_MODEL,
      openrouterKey,
      { "HTTP-Referer": "https://syntra-intel.replit.app", "X-Title": "Syntra Intel" },
    );
    log("openrouter");
    return reply;
  }

  throw new Error("No API keys available.");
}

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, history = [] } = parsed.data;

  try {
    const { context, sources } = retrieveRelevantContext(message);

    const systemPrompt = `You are Syntra Intel, a research assistant. Answer ONLY using the dataset excerpts below — no training knowledge, no inference, no guessing. Reply in the same language as the user's question (English, Filipino/Tagalog, or Bisaya/Cebuano). If the question is off-topic (not about AI-generated images, deepfakes, synthetic media, or media literacy), reply in one sentence: "I can only answer questions about AI-generated images, deepfakes, and media literacy." If the excerpts lack enough information to answer, say so in one sentence and stop. Cite every fact inline as *(Source Label)*. Never extrapolate or fill gaps. Write one plain paragraph, no headers or bullet points, 200 words minimum.

RESEARCH DATASETS:
${context}`;

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    let provider = "unknown";
    const reply = await callWithFallback(messages, (p) => { provider = p; });

    req.log.info({ sources, provider }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply: reply || "I could not generate a response. Please try again.",
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Chat API error");
    if (isRateLimitError(err)) {
      res.status(429).json({ error: "Both AI providers are temporarily busy. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Failed to generate response. Please try again." });
    }
  }
});

export default router;
