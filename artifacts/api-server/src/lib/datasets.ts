import fs from "fs";
import path from "path";

export interface DatasetEntry {
  name: string;
  label: string;
  content: string;
}

function loadDataset(filename: string): string {
  const candidates = [
    path.join(process.cwd(), "../../attached_assets", filename),
    path.join(process.cwd(), "attached_assets", filename),
  ];
  for (const p of candidates) {
    try {
      return fs.readFileSync(p, "utf-8");
    } catch {
      // try next
    }
  }
  return "";
}

const DATASETS: DatasetEntry[] = [
  {
    name: "Dataset_01_Human_Vision",
    label: "Gilbert & Gilbert (2024) — AI in Combatting Deepfakes",
    content: loadDataset("Dataset_01_Human_Vision_1778249587131.txt"),
  },
  {
    name: "Dataset_02_AI_Defense",
    label: "Nightingale & Farid, PNAS (2022) — AI-synthesized faces",
    content: loadDataset("Dataset_02_AI_Defense_1778249587130.txt"),
  },
  {
    name: "Dataset_03_Media_Ethics",
    label: "Makowski et al. (2025) — Too beautiful to be fake",
    content: loadDataset("Dataset_03_Media_Ethics_1778249587129.txt"),
  },
  {
    name: "Dataset_04_Social_Impact",
    label: "Issues in Information Systems (2025) — AI-generated misinformation on social media",
    content: loadDataset("Dataset_04_Social_Impact_1778249587128.txt"),
  },
  {
    name: "Dataset_05_User_Psychology",
    label: "Folorunsho & Boamah (2025) — Deepfake Technology and its Impact",
    content: loadDataset("Dataset_05_User_Psychology_1778249587127.txt"),
  },
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strip the language-instruction prefix injected by the frontend.
 * Format: "[Some instruction.]\nActual user query"
 */
function extractUserQuery(raw: string): string {
  const match = raw.match(/^\[.*?\]\s*\n([\s\S]*)$/);
  return match ? match[1].trim() : raw.trim();
}

function scoreRelevance(content: string, query: string): number {
  const normalizedQuery = query.toLowerCase();
  const normalizedContent = content.toLowerCase();
  const words = normalizedQuery.split(/\s+/).filter((w) => w.length > 3);
  let score = 0;
  for (const word of words) {
    const regex = new RegExp(escapeRegex(word), "gi");
    const matches = normalizedContent.match(regex);
    if (matches) score += matches.length;
  }
  return score;
}

/**
 * Always include all 5 datasets in full, sorted by relevance (most relevant first).
 * Gemini 2.5 Flash has a 1M token context window; all 5 datasets together are ~74KB,
 * so there is no need to truncate. Truncating was the root cause of missed answers.
 */
export function retrieveRelevantContext(
  query: string,
  // maxChars kept for API compatibility but no longer used for truncation
  _maxChars = 12000,
): { context: string; sources: string[] } {
  const cleanQuery = extractUserQuery(query);

  const sorted = DATASETS.map((ds) => ({
    ds,
    score: scoreRelevance(ds.content, cleanQuery),
  })).sort((a, b) => b.score - a.score);

  const usedSources: string[] = [];
  let context = "";

  for (const { ds } of sorted) {
    context += `\n\n--- SOURCE: ${ds.label} ---\n${ds.content}`;
    usedSources.push(ds.label);
  }

  return { context: context.trim(), sources: usedSources };
}

export { DATASETS };
