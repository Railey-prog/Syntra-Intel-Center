import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { SendChatMessageBody, SendChatMessageResponse } from "@workspace/api-zod";
import { retrieveRelevantContext } from "../lib/datasets";

const router: IRouter = Router();

const MODEL = "gemini-2.5-flash";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
    if (!apiKey || !baseUrl) {
      throw new Error("Gemini AI Integrations environment variables are not set.");
    }
    _ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: "",
        baseUrl,
      },
    });
  }
  return _ai;
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

    const contents = [
      ...history.map((h) => ({
        role: h.role as "user" | "model",
        parts: [{ text: h.content }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const response = await getAI().models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 8192,
        temperature: 0.2,
      },
    });

    const reply =
      response.text ??
      "I could not generate a response. Please try again.";

    req.log.info({ sources, model: MODEL }, "Chat response generated");

    res.json(
      SendChatMessageResponse.parse({
        reply,
        sources,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Gemini API error");
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

export default router;
