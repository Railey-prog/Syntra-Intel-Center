import { Router, type IRouter } from "express";
import { AnalyzeImageBody, AnalyzeImageResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const SIGHTENGINE_API_USER = process.env.SIGHTENGINE_API_USER;
const SIGHTENGINE_API_SECRET = process.env.SIGHTENGINE_API_SECRET;

router.post("/analyze-image", async (req, res): Promise<void> => {
  const parsed = AnalyzeImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageUrl, imageBase64 } = parsed.data;

  if (!imageUrl && !imageBase64) {
    res.status(400).json({ error: "Either imageUrl or imageBase64 must be provided." });
    return;
  }

  if (!SIGHTENGINE_API_USER || !SIGHTENGINE_API_SECRET) {
    res.status(500).json({ error: "SightEngine API credentials are not configured." });
    return;
  }

  try {
    let sightEngineResponse: Response;

    if (imageUrl) {
      const params = new URLSearchParams({
        url: imageUrl,
        models: "genai",
        api_user: SIGHTENGINE_API_USER,
        api_secret: SIGHTENGINE_API_SECRET,
      });
      sightEngineResponse = await fetch(`https://api.sightengine.com/1.0/check.json?${params.toString()}`);
    } else {
      const mimeMatch = imageBase64!.match(/^data:(image\/(?:png|jpeg|webp));base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const extMap: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
      const ext = extMap[mimeType] ?? "jpg";
      const base64Data = imageBase64!.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: mimeType });
      formData.append("media", blob, `image.${ext}`);
      formData.append("models", "genai");
      formData.append("api_user", SIGHTENGINE_API_USER);
      formData.append("api_secret", SIGHTENGINE_API_SECRET);

      sightEngineResponse = await fetch("https://api.sightengine.com/1.0/check.json", {
        method: "POST",
        body: formData,
      });
    }

    if (!sightEngineResponse.ok) {
      const errText = await sightEngineResponse.text();
      req.log.error({ status: sightEngineResponse.status, body: errText }, "SightEngine API error");
      res.status(502).json({ error: "Image analysis service returned an error. Please try again." });
      return;
    }

    const data = (await sightEngineResponse.json()) as {
      status: string;
      type?: { ai_generated: number; real: number };
      error?: { message: string };
    };

    if (data.status !== "success" || !data.type) {
      req.log.error({ data }, "Unexpected SightEngine response");
      res.status(502).json({ error: data.error?.message ?? "Unexpected response from image analysis service." });
      return;
    }

    const aiScore = data.type.ai_generated;
    const isAiGenerated = aiScore >= 0.5;

    let verdict: string;
    if (aiScore >= 0.85) {
      verdict = "Very likely AI-generated";
    } else if (aiScore >= 0.65) {
      verdict = "Probably AI-generated";
    } else if (aiScore >= 0.5) {
      verdict = "Possibly AI-generated";
    } else if (aiScore >= 0.35) {
      verdict = "Probably a real photo";
    } else {
      verdict = "Very likely a real photo";
    }

    req.log.info({ aiScore, verdict }, "Image analyzed");

    res.json(
      AnalyzeImageResponse.parse({
        isAiGenerated,
        confidence: isAiGenerated ? aiScore : 1 - aiScore,
        aiScore,
        verdict,
        details: {
          aiGeneratedScore: aiScore,
          realScore: 1 - aiScore,
        },
      })
    );
  } catch (err) {
    req.log.error({ err }, "Image analysis error");
    res.status(500).json({ error: "Failed to analyze image. Please try again." });
  }
});

export default router;
