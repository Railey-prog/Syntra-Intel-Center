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

    const systemPrompt = `You are Syntra Intel, a digital literacy assistant focused on deepfakes and misinformation. Answer ONLY using the dataset excerpts below — no training knowledge, no guessing. Reply in the same language as the user's question (English, Filipino/Tagalog, or Bisaya/Cebuano).

SCOPE: If the question is off-topic (not about deepfakes, AI-generated media, misinformation, or media literacy), say so in one sentence and suggest a fact-checking tool like InVID or Google Fact Check. Stop there.

GROUNDING: Every claim must come from the excerpts. Cite inline as *(Source Label)*. Label anything not confirmed by the excerpts as "unconfirmed." Never infer or fill gaps.

FORMAT (keep under 200 words total). Use markdown:
One sentence directly answering the question as a plain opening paragraph.
Then a ### section header naming the topic (e.g. ### Key Methods, ### How to Spot It).
Then 2–4 bullet points, each with a **Bold Label**: followed by the explanation and a citation.
End with a ### Summary section containing one actionable takeaway.
Use *italic* for all inline citations like *(Source Label, Year)*.

TONE: Simple, direct, factual. No jargon without a definition. No alarmist language.

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
