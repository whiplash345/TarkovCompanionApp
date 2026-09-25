import nlp from "compromise";
import type { RagDocument } from "./ChatBackend";
import { getSupabaseClient, getSupabaseFunctionError } from "./supabaseClient";

type SemanticMatch = Pick<RagDocument, "id" | "source" | "title" | "content" | "metadata"> & {
  similarity: number;
};

type RankedDocument = {
  document: RagDocument;
  vectorScore: number;
  keywordScore: number;
};

const ignoredTerms = new Set([
  "about", "after", "again", "also", "and", "are", "can", "could", "find",
  "from", "have", "help", "how", "into", "need", "please", "should", "that",
  "the", "their", "them", "then", "there", "these", "this", "what", "when",
  "where", "which", "with", "would", "your",
]);

function extractKeywords(text: string): string[] {
  const parsed = nlp(text);
  const nlpTerms = [
    ...parsed.nouns().out("array"),
    ...parsed.topics().out("array"),
  ];
  const rawTerms = text.match(/[a-z0-9]+/gi) ?? [];

  return [...new Set([...nlpTerms, ...rawTerms]
    .map((term) => term.toLowerCase())
    .filter((term) => term.length > 2 && !ignoredTerms.has(term)))];
}

function findKeywordMatches(query: string, documents: RagDocument[]): Map<string, number> {
  const keywords = extractKeywords(query);
  const matches = new Map<string, number>();
  if (keywords.length === 0) return matches;

  for (const document of documents) {
    const title = document.title.toLowerCase();
    const content = document.content.toLowerCase();
    let score = 0;

    for (const keyword of keywords) {
      if (title.includes(keyword)) score += 3;
      if (content.includes(keyword)) score += 1;
    }
    if (score > 0) matches.set(document.id, score);
  }

  return matches;
}

export async function retrieveRagContext(
  query: string,
  documents: RagDocument[]
): Promise<string> {
  const keywordMatches = findKeywordMatches(query, documents);
  const { data, error } = await getSupabaseClient().functions.invoke<{
    matches: SemanticMatch[];
  }>("tarkov-chat", {
    body: { action: "retrieve", query, documents },
  });

  if (error) {
    throw new Error(`RAG retrieval failed: ${await getSupabaseFunctionError(error)}`);
  }

  const semanticMatches = data?.matches ?? [];
  const maxKeywordScore = Math.max(1, ...keywordMatches.values());
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const ranked = new Map<string, RankedDocument>();

  for (const match of semanticMatches) {
    const document = documentById.get(match.id) ?? match;
    ranked.set(match.id, {
      document,
      vectorScore: match.similarity,
      keywordScore: (keywordMatches.get(match.id) ?? 0) / maxKeywordScore,
    });
  }

  for (const [id, keywordScore] of keywordMatches) {
    const document = documentById.get(id);
    if (!document) continue;
    const current = ranked.get(id);
    if (current) {
      current.keywordScore = keywordScore / maxKeywordScore;
    } else {
      ranked.set(id, { document, vectorScore: 0, keywordScore: keywordScore / maxKeywordScore });
    }
  }

  const digest = [...ranked.values()]
    .sort((left, right) => {
      const leftScore = left.vectorScore * 0.65 + left.keywordScore * 0.35;
      const rightScore = right.vectorScore * 0.65 + right.keywordScore * 0.35;
      return rightScore - leftScore;
    })
    .slice(0, 6)
    .map(({ document, vectorScore, keywordScore }) => {
      const source = document.source === "main-task" ? "Main task" : "Side task";
      const signals = [
        vectorScore > 0 ? `semantic similarity ${vectorScore.toFixed(2)}` : "",
        keywordScore > 0 ? "keyword match" : "",
      ].filter(Boolean).join(", ");
      return `[${source}: ${document.title}${signals ? `; ${signals}` : ""}]\n${document.content}`;
    });

  return digest.length > 0
    ? digest.join("\n\n").slice(0, 7000)
    : "No matching task notes were retrieved. Do not infer task-specific details that are not otherwise known.";
}