import { Router, type IRouter } from "express";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODEL = "arcee-ai/trinity-large-thinking:free";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

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

async function callOpenRouter(
  messages: { role: string; content: string }[],
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set.");

  const res = await fetch(OPENROUTER_BASE, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://syntra.replit.app",
      "X-Title": "Syntra Intel",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 8192,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null; reasoning?: string } }[];
    error?: { message?: string };
  };

  if (data.error) throw new Error(data.error.message ?? "Unknown OpenRouter error");

  const message = data.choices?.[0]?.message;
  // Thinking models (e.g. trinity-large-thinking) may return content: null
  // with the actual answer in the `reasoning` field. Fall back to it.
  const raw = message?.content || message?.reasoning || "";
  // Strip internal <think>...</think> blocks that thinking models emit
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
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

    const systemPrompt = `You are Syntra Intel — a research assistant that answers questions STRICTLY and ONLY using the five peer-reviewed dataset excerpts below.

LANGUAGE RULE: Detect the language of the user's actual question and reply ENTIRELY in that language (English, Filipino/Tagalog, or Bisaya/Cebuano). Do NOT mix languages in your reply.

═══════════════════════════════════════════
TOPIC GATE — CHECK THIS FIRST
═══════════════════════════════════════════
These datasets ONLY cover: AI-generated images, deepfakes, synthetic media, media literacy, misinformation on social media, and the social/psychological impact of AI-generated content.

If the user's question is NOT about these topics, refuse immediately — one sentence, no explanation:

- English: "I can only answer questions about AI-generated images, deepfakes, and media literacy."
- Filipino: "Makakatulong lamang ako sa mga tanong tungkol sa AI-generated na larawan, deepfakes, at media literacy."
- Bisaya: "Makatubag lamang ko sa mga pangutana bahin sa AI-generated nga mga hulagway, deepfakes, ug media literacy."

Do NOT attempt to answer off-topic questions even if you know the answer from your training data.

═══════════════════════════════════════════
STRICT GROUNDING RULES — NEVER VIOLATE
═══════════════════════════════════════════
1. ONLY use facts, numbers, quotes, and findings that appear in the dataset excerpts below.
2. NEVER invent, guess, or add any fact not present in the excerpts — even if it sounds plausible.
3. NEVER mix up sources. Each citation must exactly match the source label shown in the excerpts.
4. If the question is on-topic but the excerpts lack sufficient information, say so in the user's language. Do not attempt an answer.
5. When translating facts to Filipino or Bisaya, keep numbers, names, and proper nouns exactly as written in the source.

═══════════════════════════════════════════
ALL FIVE RESEARCH DATASETS (YOUR ONLY SOURCE)
═══════════════════════════════════════════
${context}

═══════════════════════════════════════════
CITATION & FORMAT RULES
═══════════════════════════════════════════
- Cite every fact inline: *(Exact Source Label, Year)*
- Use the exact source label from the dataset headers above — do NOT swap or combine labels
- Use ## headers, bullet points, and **bold** for key terms
- Keep responses concise: 3–5 sections maximum
- End with **Key Takeaway:** summarizing the main finding in the user's language`;

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const reply = await withRetry(() => callOpenRouter(messages));

    req.log.info({ sources, model: MODEL }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply: reply || "I could not generate a response. Please try again.",
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "OpenRouter API error");
    if (isRateLimitError(err)) {
      res.status(429).json({ error: "The chatbot is temporarily busy due to high demand. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Failed to generate response. Please try again." });
    }
  }
});

export default router;
