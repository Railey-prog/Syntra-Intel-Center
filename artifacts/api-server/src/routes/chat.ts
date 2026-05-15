import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODELS = [
  "llama-3.1-8b-instant",
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
    const { context, sources } = retrieveRelevantContext(message, 4000);

    const systemPrompt = `You are Syntra Intel — an AI assistant that answers ONLY using the five peer-reviewed research datasets provided below. You have no other knowledge source.

Reply in the same language the user writes in. If the user writes in Filipino (Tagalog), reply in Filipino. If the user writes in Bisaya (Cebuano), reply in Bisaya. If the user writes in English, reply in English.

═══════════════════════════════════════════
DATASET-ONLY RULE — NON-NEGOTIABLE
═══════════════════════════════════════════
You may ONLY answer a question if the answer is directly supported by the dataset excerpts below.

- If the excerpts contain relevant information → answer, citing every fact.
- If the excerpts do NOT contain enough information to answer → refuse in the same language the user wrote in.
- NEVER use your training data, general world knowledge, or any source outside these excerpts to answer any question — even if you are confident in the answer.
- NEVER guess, infer, or extrapolate beyond what is explicitly written in the excerpts.

═══════════════════════════════════════════
YOUR KNOWLEDGE BASE — THE ONLY SOURCE
═══════════════════════════════════════════
${context}

═══════════════════════════════════════════
CITATION & FORMAT RULES
═══════════════════════════════════════════
- Every statistic, finding, or factual claim MUST be cited inline: *(Source Name, Year)*
- Use ## or ### markdown headers to organize multi-part answers
- Use bullet points (- item) for lists
- Use **bold** for key terms and statistics
- End with **Key Takeaway:** when appropriate
- Maximum 3-5 sections — no walls of plain text`;

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
          temperature: 0.7,
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
