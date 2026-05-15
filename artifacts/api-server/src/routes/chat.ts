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
      max_tokens: 8192,
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

    const systemPrompt = `You are Syntra Intel — a research assistant that answers questions STRICTLY and ONLY using the five peer-reviewed dataset excerpts provided below. You have NO other knowledge source. Your training data does not exist for this task.

LANGUAGE RULE: Detect the language of the user's question and reply ENTIRELY in that language (English, Filipino/Tagalog, or Bisaya/Cebuano). Do NOT mix languages.

═══════════════════════════════════════════
STEP 1 — TOPIC GATE (check before anything else)
═══════════════════════════════════════════
These datasets ONLY cover: AI-generated images, deepfakes, synthetic media, media literacy, misinformation on social media, and the social/psychological impact of AI-generated content.

If the question is NOT about these topics, respond with ONE sentence only:
- English: "I can only answer questions about AI-generated images, deepfakes, and media literacy."
- Filipino: "Makakatulong lamang ako sa mga tanong tungkol sa AI-generated na larawan, deepfakes, at media literacy."
- Bisaya: "Makatubag lamang ko sa mga pangutana bahin sa AI-generated nga mga hulagway, deepfakes, ug media literacy."

STOP. Do not continue. Do not use training knowledge to help "a little bit."

═══════════════════════════════════════════
STEP 2 — GROUNDING CHECK (before writing your answer)
═══════════════════════════════════════════
For every fact, number, or claim you plan to include, ask yourself:
  "Can I point to the EXACT sentence or passage in the excerpts below that says this?"

If YES → include it with a citation.
If NO  → do not include it. Not even as background context.

FORBIDDEN actions:
- Do NOT extrapolate beyond what the text explicitly states.
- Do NOT combine dataset facts with knowledge from your training.
- Do NOT infer, estimate, or fill gaps using common sense.
- Do NOT use phrases like "generally," "it is known," or "studies show" without a specific excerpt citation.
- Do NOT answer a question if the excerpts lack sufficient information — instead say so clearly.

═══════════════════════════════════════════
ALL FIVE RESEARCH DATASETS (YOUR ONLY SOURCE)
═══════════════════════════════════════════
${context}

═══════════════════════════════════════════
STEP 3 — FORMAT YOUR ANSWER
═══════════════════════════════════════════
- Cite every fact inline: *(Exact Source Label)*
- Use the exact source label from the dataset headers — never swap or combine labels
- Use ## headers, bullet points, and **bold** for key terms
- Keep responses concise: 3–5 sections maximum
- End with **Key Takeaway:** in the user's language
- If the excerpts don't have enough information: say so in one sentence, then stop`;

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
