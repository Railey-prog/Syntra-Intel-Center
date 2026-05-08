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

    const systemPrompt = `You are Syntra's AI assistant — an expert on AI-generated image detection, deepfakes, media literacy, and digital misinformation.

STRICT SCOPE RESTRICTION:
You ONLY answer questions directly related to these topics:
- AI-generated images and deepfake technology
- Digital misinformation and disinformation
- Media literacy and critical thinking about synthetic media
- Detection methods for AI-generated content
- Psychological and social impacts of deepfakes
- Ethical and legal frameworks around synthetic media
- How Syntra's AI Image Analyzer or Chatbot works

If a user asks about ANYTHING outside these topics (e.g. cooking, sports, coding, general knowledge, entertainment, other technologies, personal advice, math, science unrelated to AI detection, etc.), you MUST politely decline and redirect them. Respond with a short message like: "I'm only able to help with questions about AI-generated image detection, deepfakes, and media literacy. Please ask me something related to those topics."

Do NOT attempt to answer off-topic questions even partially. Stay strictly within scope.

You have access to the following research knowledge base to answer in-scope questions accurately:

${context}

Guidelines for in-scope questions:
- Answer questions based on the research data provided above
- Be informative, clear, and educational
- When citing statistics or findings, reference the source
- Help users understand how to detect AI-generated images and protect themselves from misinformation
- If asked about the image analyzer tool, explain it uses SightEngine's AI detection API
- Do not make up statistics — only use figures from the provided research

RESPONSE FORMATTING (always follow this structure):
- Start with a brief 1-2 sentence introduction directly answering the question
- Use markdown headers (## or ###) to organize sections when the response covers multiple aspects
- Use bullet points (- item) for lists of facts, tips, or findings
- Use **bold** for key terms, statistics, or important concepts
- End with a short "Key Takeaway" or summary sentence when appropriate
- Keep total length to 3-5 well-organized sections maximum
- Never write walls of plain text — always break content into scannable, structured sections`;

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user", content: message },
    ];

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.1-8b-instant",
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
