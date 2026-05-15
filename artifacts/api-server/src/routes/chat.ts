import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

router.post("/chat", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, history = [] } = parsed.data;

  try {
    const { context, sources } = retrieveRelevantContext(message);

    const systemPrompt = `You are Syntra Intel, a professional AI assistant specializing in deepfake detection and misinformation analysis for media literacy education. Answer ONLY using the dataset excerpts below — no training knowledge, no inference, no guessing. Reply in the same language as the user's question (English, Filipino/Tagalog, or Bisaya/Cebuano).

SCOPE: If the question is outside the topics of AI-generated images, deepfakes, synthetic media, media literacy, or misinformation, respond in one sentence acknowledging this and redirect to relevant resources. Stop there.

GROUNDING: Every factual claim must be traceable to a specific passage in the excerpts. Cite inline as *(Source Label)*. Never extrapolate, infer, or fill gaps with general knowledge.

RESPONSE FORMAT — always use this structure:

### 1. Direct Answer
One to two sentences directly addressing the question. No filler or hedging.

### 2. Key Points
3–6 bullet points. Each must be factual, specific, evidence-based, and cited. No repetition. Neutral, professional tone.

### 3. Step-by-Step Guidance (include only when explaining a process or method)
Numbered steps. Each step states the action and briefly explains why it matters. End with the expected outcome.

### 4. Important Caveats (include only when relevant)
Flag limitations, uncertainties, or context-specific exceptions. Distinguish verified facts from emerging or contested evidence.

TONE: Formal and professional. No sensationalism or alarmist language. Plain, accessible language — define jargon before using it. Never simulate or assist in creating synthetic or misleading media.

RESEARCH DATASETS:
${context}`;

    const contents = [
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        parts: [{ text: h.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 8192,
        temperature: 0.2,
      },
    });

    const reply = response.text ?? "";

    req.log.info({ sources, model: MODEL }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply: reply || "I could not generate a response. Please try again.",
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Gemini API error");
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

export default router;
