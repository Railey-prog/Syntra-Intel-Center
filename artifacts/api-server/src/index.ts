import app from "./app";
import { logger } from "./lib/logger";

const REQUIRED_ENV_VARS = [
  { key: "GROQ_API_KEY", desc: "Groq AI (chatbot)" },
  { key: "SIGHTENGINE_API_USER", desc: "SightEngine (image analysis)" },
  { key: "SIGHTENGINE_API_SECRET", desc: "SightEngine (image analysis)" },
];

const missing: string[] = [];
for (const { key, alt, desc } of REQUIRED_ENV_VARS) {
  const present = process.env[key] || (alt && process.env[alt]);
  if (!present) {
    missing.push(`${key} — required for ${desc}`);
  }
}

if (missing.length > 0) {
  logger.warn({ missing }, `⚠️  Missing environment variable(s) — some features will fail:\n${missing.map((m) => `  • ${m}`).join("\n")}`);
} else {
  logger.info("✅ All required environment variables are present.");
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
