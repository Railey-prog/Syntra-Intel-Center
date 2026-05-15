import { Router, type IRouter } from "express";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const OR_HEADERS = {
  "HTTP-Referer": "https://syntra-intel.replit.app",
  "X-Title": "Syntra Intel",
};

interface Provider {
  name: string;
  base: string;
  model: string;
  keyEnv: string;
  extraHeaders?: Record<string, string>;
}

const PROVIDERS: Provider[] = [
  {
    name: "groq",
    base: GROQ_BASE,
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
  },
  {
    name: "openrouter/gemma",
    base: OPENROUTER_BASE,
    model: "google/gemma-3-27b-it:free",
    keyEnv: "OPENROUTER_API_KEY",
    extraHeaders: OR_HEADERS,
  },
  {
    name: "openrouter/llama",
    base: OPENROUTER_BASE,
    model: "meta-llama/llama-3.3-70b-instruct:free",
    keyEnv: "OPENROUTER_API_KEY",
    extraHeaders: OR_HEADERS,
  },
  {
    name: "openrouter/mistral",
    base: OPENROUTER_BASE,
    model: "mistralai/mistral-7b-instruct:free",
    keyEnv: "OPENROUTER_API_KEY",
    extraHeaders: OR_HEADERS,
  },
  {
    name: "openrouter/deepseek",
    base: OPENROUTER_BASE,
    model: "deepseek/deepseek-chat-v3-0324:free",
    keyEnv: "OPENROUTER_API_KEY",
    extraHeaders: OR_HEADERS,
  },
];

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.startsWith("429") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota");
}

async function callLLM(
  messages: { role: string; content: string }[],
  provider: Provider,
): Promise<string> {
  const apiKey = process.env[provider.keyEnv];
  if (!apiKey) throw new Error(`Missing env var ${provider.keyEnv}`);

  const res = await fetch(provider.base, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...provider.extraHeaders,
    },
    body: JSON.stringify({
      model: provider.model,
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
): Promise<{ reply: string; provider: string }> {
  const errors: string[] = [];

  for (const provider of PROVIDERS) {
    try {
      const reply = await callLLM(messages, provider);
      return { reply, provider: provider.name };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${msg.slice(0, 120)}`);
      if (!isRateLimitError(err)) {
        throw err;
      }
    }
  }

  throw new Error(`All providers rate-limited.\n${errors.join("\n")}`);
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

    const { reply, provider } = await callWithFallback(messages);

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
      res.status(429).json({ error: "All AI providers are temporarily busy. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Failed to generate response. Please try again." });
    }
  }
});

export default router;
