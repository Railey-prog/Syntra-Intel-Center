import { Router, type IRouter } from "express";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODEL = "llama-3.3-70b-versatile";
const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate limit");
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 2000,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === maxAttempts) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function callGroq(
  messages: { role: string; content: string }[],
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set.");

  const res = await fetch(GROQ_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message ?? "Unknown Groq error");

  return data.choices?.[0]?.message?.content ?? "";
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

    const systemPrompt = `You are Syntra Intel, a research assistant. Answer ONLY using the dataset excerpts below — no training knowledge, no inference, no guessing. Reply in the same language as the user's question (English, Filipino/Tagalog, or Bisaya/Cebuano). If the question is off-topic (not about AI-generated images, deepfakes, synthetic media, or media literacy), reply in one sentence: "I can only answer questions about AI-generated images, deepfakes, and media literacy." If the excerpts lack enough information to answer, say so in one sentence and stop. Cite every fact inline as *(Source Label)*. Never extrapolate or fill gaps. Write one plain paragraph, no headers or bullet points, 150 words maximum.

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

    const reply = await withRetry(() => callGroq(messages));

    req.log.info({ sources, model: MODEL }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply: reply || "I could not generate a response. Please try again.",
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Groq API error");
    if (isRateLimitError(err)) {
      res.status(429).json({ error: "The chatbot is temporarily busy due to high demand. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Failed to generate response. Please try again." });
    }
  }
});

export default router;
