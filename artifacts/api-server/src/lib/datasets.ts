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

/**
 * Score a block of text against a query using keyword frequency.
 */
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
 * Split dataset content into paragraphs (blocks separated by blank lines).
 * Paragraphs shorter than minLen chars are merged with the next one.
 */
function splitIntoParagraphs(content: string, minLen = 150): string[] {
  const raw = content.split(/\n{2,}/);
  const merged: string[] = [];
  let buffer = "";
  for (const block of raw) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    buffer = buffer ? `${buffer}\n\n${trimmed}` : trimmed;
    if (buffer.length >= minLen) {
      merged.push(buffer);
      buffer = "";
    }
  }
  if (buffer) merged.push(buffer);
  return merged;
}

/**
 * Retrieve the most relevant paragraphs from all 5 datasets.
 *
 * Strategy:
 * 1. Split every dataset into paragraphs.
 * 2. Score each paragraph against the query.
 * 3. Guarantee each dataset contributes at least its top paragraph so no
 *    source is silenced on low-relevance queries.
 * 4. Fill the remaining budget with the highest-scoring paragraphs across
 *    all datasets, ranked globally.
 * 5. Cap total context at maxChars (~30 000 chars ≈ 7 500 tokens) to
 *    stay well within free-tier rate limits on Render / Google AI Studio.
 */
export function retrieveRelevantContext(
  query: string,
  maxChars = 30000,
): { context: string; sources: string[] } {
  const cleanQuery = extractUserQuery(query);

  type ScoredParagraph = {
    label: string;
    text: string;
    score: number;
  };

  const perDataset: { label: string; paragraphs: ScoredParagraph[] }[] = [];

  for (const ds of DATASETS) {
    const paragraphs = splitIntoParagraphs(ds.content);
    const scored: ScoredParagraph[] = paragraphs.map((text) => ({
      label: ds.label,
      text,
      score: scoreRelevance(text, cleanQuery),
    }));
    scored.sort((a, b) => b.score - a.score);
    perDataset.push({ label: ds.label, paragraphs: scored });
  }

  const includedByLabel: Record<string, string[]> = {};
  const includedSet = new Set<ScoredParagraph>();
  let totalChars = 0;

  // Step 1: guarantee at least the top paragraph from each dataset
  for (const { label, paragraphs } of perDataset) {
    if (paragraphs.length === 0) continue;
    const top = paragraphs[0];
    includedByLabel[label] = [top.text];
    includedSet.add(top);
    totalChars += top.text.length;
  }

  // Step 2: fill remaining budget with best paragraphs globally
  const allRemaining: ScoredParagraph[] = perDataset
    .flatMap(({ paragraphs }) => paragraphs.slice(1))
    .filter((p) => !includedSet.has(p))
    .sort((a, b) => b.score - a.score);

  for (const p of allRemaining) {
    if (totalChars + p.text.length > maxChars) continue;
    if (!includedByLabel[p.label]) includedByLabel[p.label] = [];
    includedByLabel[p.label].push(p.text);
    includedSet.add(p);
    totalChars += p.text.length;
  }

  // Step 3: build final context, datasets ordered by total relevance score
  const datasetOrder = perDataset
    .map(({ label, paragraphs }) => ({
      label,
      totalScore: paragraphs
        .filter((p) => includedSet.has(p))
        .reduce((s, p) => s + p.score, 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  const usedSources: string[] = [];
  let context = "";

  for (const { label } of datasetOrder) {
    const chunks = includedByLabel[label];
    if (!chunks || chunks.length === 0) continue;
    context += `\n\n--- SOURCE: ${label} ---\n${chunks.join("\n\n")}`;
    usedSources.push(label);
  }

  return { context: context.trim(), sources: usedSources };
}

export { DATASETS };
