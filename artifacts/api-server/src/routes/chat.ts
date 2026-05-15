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

    const systemPrompt = `You are Syntra Intel, a research assistant. Answer ONLY using the dataset excerpts below — no training knowledge, no inference, no guessing. Reply in the same language as the user's question (English, Filipino/Tagalog, or Bisaya/Cebuano). If the question is off-topic (not about AI-generated images, deepfakes, synthetic media, or media literacy), reply in one sentence: "I can only answer questions about AI-generated images, deepfakes, and media literacy." If the excerpts lack enough information to answer, say so in one sentence and stop. Cite every fact inline as *(Source Label)*. Never extrapolate or fill gaps. Write one plain paragraph, no headers or bullet points, 200 words minimum.

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
