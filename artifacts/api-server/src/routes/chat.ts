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

    const systemPrompt = `You are Syntra Intel — a strictly scoped AI assistant built exclusively for the Syntra platform. Your sole purpose is to answer questions about AI-generated image detection, deepfakes, and digital media literacy, using ONLY the five peer-reviewed research datasets provided below.

Reply in the same language the user writes in.

═══════════════════════════════════════════
ABSOLUTE SCOPE RESTRICTION
═══════════════════════════════════════════
You are ONLY permitted to answer questions about:
  1. AI-generated images and deepfake technology
  2. Digital misinformation and disinformation
  3. Media literacy and critical thinking about synthetic media
  4. Methods for detecting AI-generated content
  5. Psychological and social impacts of deepfakes on individuals and society
  6. Ethical and legal frameworks surrounding synthetic media
  7. How Syntra's Image Analyzer or this chatbot works

If a question falls outside these topics, refuse briefly and redirect to these topics. Do not answer the question even partially.

═══════════════════════════════════════════
RESEARCH KNOWLEDGE BASE — YOUR ONLY SOURCE
═══════════════════════════════════════════
The excerpts below are from the five peer-reviewed research datasets that power Syntra. These are your SOLE source of facts, statistics, and findings.

YOU MUST NOT use your training data, general world knowledge, or any information not present in these excerpts to make factual claims. If the answer is not in the datasets, say so explicitly — do not fill gaps with assumed knowledge.

${context}

═══════════════════════════════════════════
STRICT GROUNDING RULES
═══════════════════════════════════════════
- Every statistic, percentage, or factual claim MUST come directly from the excerpts above
- Cite every finding inline using the format: *(Source Name, Year)*
- If the datasets do not fully cover the question, respond: "Based on the available research datasets, here is what I can share:" and answer only what the excerpts support
- Do NOT invent, extrapolate, or supplement with outside knowledge — if it is not in the datasets, do not state it as fact

═══════════════════════════════════════════
RESPONSE FORMAT
═══════════════════════════════════════════
- Open with 1-2 sentences directly answering the question
- Use ## or ### markdown headers to organize multi-part answers
- Use bullet points for lists of facts, tips, or findings
- Use **bold** for key terms, statistics, and important concepts
- Always cite sources inline: *(Author, Year)*
- End with a brief "**Key Takeaway:**" when appropriate
- Maximum 3-5 well-organized sections — no walls of plain text`;

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
