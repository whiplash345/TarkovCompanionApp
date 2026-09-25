// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const embeddingModel = "text-embedding-3-small";
const chatModel = "gpt-4.1-mini";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiApiKey = Deno.env.get("OPENAI_API_KEY")!;
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type TaskDocument = {
  id: string;
  source: "main-task" | "side-task";
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

async function createEmbeddings(input: string[]): Promise<number[][]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: embeddingModel, input }),
  });

  if (!response.ok) throw new Error(`Embedding request failed (${response.status}).`);
  const result = await response.json();
  return result.data.sort((left, right) => left.index - right.index).map((item) => item.embedding);
}

async function hashDocument(document: TaskDocument): Promise<string> {
  const text = `${document.source}\n${document.title}\n${document.content}\n${JSON.stringify(document.metadata)}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function indexChangedDocuments(input: unknown): Promise<void> {
  if (!Array.isArray(input) || input.length === 0) return;
  const documents = input.filter((item): item is TaskDocument =>
    item && typeof item.id === "string" &&
    (item.source === "main-task" || item.source === "side-task") &&
    typeof item.title === "string" && typeof item.content === "string"
  );
  const prepared = await Promise.all(documents.map(async (document) => ({
    document,
    contentHash: await hashDocument(document),
  })));
  const changed = [];

  for (let offset = 0; offset < prepared.length; offset += 100) {
    const batch = prepared.slice(offset, offset + 100);
    const { data, error } = await admin
      .from("task_documents")
      .select("id, content_hash")
      .in("id", batch.map(({ document }) => document.id));
    if (error) throw error;

    const hashes = new Map((data ?? []).map((row) => [row.id, row.content_hash]));
    changed.push(...batch.filter(({ document, contentHash }) => hashes.get(document.id) !== contentHash));
  }

  for (let offset = 0; offset < changed.length; offset += 64) {
    const batch = changed.slice(offset, offset + 64);
    const embeddings = await createEmbeddings(batch.map(({ document }) =>
      `${document.title}\n${document.content}`
    ));
    const rows = batch.map(({ document, contentHash }, index) => ({
      ...document,
      content_hash: contentHash,
      embedding: embeddings[index],
      updated_at: new Date().toISOString(),
    }));
    const { error } = await admin.from("task_documents").upsert(rows);
    if (error) throw error;
  }
}

async function retrieve(query: string, documents: unknown) {
  await indexChangedDocuments(documents);
  const [queryEmbedding] = await createEmbeddings([query]);
  const { data, error } = await admin.rpc("match_task_documents", {
    query_embedding: queryEmbedding,
    match_count: 6,
  });
  if (error) throw error;
  return data ?? [];
}

async function answer(body: Record<string, unknown>): Promise<string> {
  const history = Array.isArray(body.history) ? body.history : [];
  const messages = [
    {
      role: "system",
      content: `${String(body.seed ?? "You are a helpful Tarkov assistant.")}\n\nRetrieved task context:\n${String(body.context ?? "No task context was found.")}`,
    },
    ...history.slice(-12).flatMap((item) => {
      if (!item || (item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") return [];
      return [{ role: item.role, content: item.content }];
    }),
    { role: "user", content: String(body.message ?? "") },
  ];
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: chatModel, messages, temperature: 0.2 }),
  });

  if (!response.ok) throw new Error(`Chat completion failed (${response.status}).`);
  const result = await response.json();
  return result.choices?.[0]?.message?.content?.trim() ?? "I couldn't find a response for that question.";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  try {
    if (!openAiApiKey || !supabaseUrl || !serviceRoleKey) {
      throw new Error("The Edge Function is missing required server secrets.");
    }
    const body = await request.json();
    if (body.action === "retrieve") {
      const matches = await retrieve(String(body.query ?? ""), body.documents);
      return Response.json({ matches }, { headers: corsHeaders });
    }
    if (body.action === "answer" && typeof body.message === "string" && body.message.trim()) {
      const reply = await answer(body);
      return Response.json({ reply }, { headers: corsHeaders });
    }
    return Response.json({ error: "Invalid chat action or payload." }, { status: 400, headers: corsHeaders });
  } catch (error) {
    console.error("[tarkov-chat] Request failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500, headers: corsHeaders }
    );
  }
});