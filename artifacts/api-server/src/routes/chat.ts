import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

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

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, history = [] } = parsed.data;

  try {
    const { context, sources } = retrieveRelevantContext(message);

    const systemPrompt = `You are Syntra Intel — an AI assistant that answers ONLY using the five peer-reviewed research datasets provided below. You have no other knowledge source.

Reply in the same language the user writes in.

═══════════════════════════════════════════
DATASET-ONLY RULE — NON-NEGOTIABLE
═══════════════════════════════════════════
You may ONLY answer a question if the answer is directly supported by the dataset excerpts below.

- If the excerpts contain relevant information → answer, citing every fact.
- If the excerpts do NOT contain enough information to answer → refuse with:
  "I can only answer based on the five research datasets loaded into Syntra. The datasets don't contain enough information to answer this question. Please ask something about AI-generated images, deepfakes, media literacy, or the social impact of synthetic media."
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

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I could not generate a response. Please try again.";

    req.log.info({ sources }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply,
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Groq API error");
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

export default router;
