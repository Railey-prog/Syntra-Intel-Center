import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODELS = [
  "llama-3.3-70b-versatile",
];

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set.");
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

function isRateLimitError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: number }).status === 429
  );
}

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, history = [] } = parsed.data;

  try {
    const { context, sources } = retrieveRelevantContext(message, 12000);

    const systemPrompt = `You are Syntra Intel — a research assistant that answers questions STRICTLY and ONLY using the dataset excerpts below. Every fact you state must come directly from the text in those excerpts.

LANGUAGE RULE: Detect the language of the user's actual question and reply ENTIRELY in that language (English, Filipino/Tagalog, or Bisaya/Cebuano). Do NOT mix languages in your reply.

═══════════════════════════════════════════
STRICT GROUNDING RULES — NEVER VIOLATE
═══════════════════════════════════════════
1. ONLY use facts, numbers, quotes, and findings that appear word-for-word or in substance in the dataset excerpts below.
2. NEVER invent, guess, or add any fact not present in the excerpts — even if it sounds plausible.
3. NEVER mix up sources. Each citation must match the correct source label shown in the excerpts.
4. If the excerpts do not contain enough information to answer, say so clearly in the user's language. Do not attempt an answer.
5. When translating facts to Filipino or Bisaya, keep numbers, names, and proper nouns exactly as written in the source. Only translate surrounding words.

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

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    let lastErr: unknown;
    for (const model of MODELS) {
      try {
        const completion = await getGroq().chat.completions.create({
          model,
          messages,
          max_tokens: 768,
          temperature: 0.2,
        });

        const reply =
          completion.choices[0]?.message?.content ??
          "I could not generate a response. Please try again.";

        req.log.info({ sources, model }, "Chat response generated");

        res.json(
          SendChatMessageResponse.parse({
            reply,
            sources,
          })
        );
        return;
      } catch (err) {
        if (isRateLimitError(err)) {
          req.log.warn({ model }, `Rate limit hit for ${model}, trying next model`);
          lastErr = err;
          continue;
        }
        throw err;
      }
    }

    req.log.error({ lastErr }, "All models rate limited");
    res.status(429).json({
      error:
        "The chatbot has reached its daily usage limit. Please try again after midnight (UTC). / Naabot na ang limitasyon ngayon. Subukan ulit bukas. / Nakab-ot na ang adlaw-adlaw nga limitasyon. Palihug sulayi ugma.",
    });
  } catch (err) {
    req.log.error({ err }, "Groq API error");
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

export default router;
