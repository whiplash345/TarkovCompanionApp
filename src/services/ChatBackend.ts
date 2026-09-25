import { mainTree } from "./TreeBackend";
import { sideTaskDefinitions } from "./SideTasksBackend";
import { retrieveRagContext } from "./RagSystem";
import { getSupabaseClient, getSupabaseFunctionError } from "./supabaseClient";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

export type RagDocument = {
  id: string;
  source: "main-task" | "side-task";
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

export type ChatRequest = {
  message: string;
  history: ChatMessage[];
};

export type ChatBackend = (request: ChatRequest) => Promise<string>;

export function buildTaskDocuments(): RagDocument[] {
  const mainDocuments = Array.from(mainTree.nodes.values()).map((node) => ({
    id: `main:${node.id}`,
    source: "main-task" as const,
    title: node.title ?? node.id,
    content: [node.title, node.description].filter(Boolean).join("\n"),
    metadata: { treeId: mainTree.id, nodeId: node.id, type: node.type },
  }));

  const sideDocuments = sideTaskDefinitions.flatMap((task) =>
    Array.from(task.tree.nodes.values()).map((node) => ({
      id: `side:${task.id}:${node.id}`,
      source: "side-task" as const,
      title: node.title ?? node.id,
      content: [task.name, node.title, node.description].filter(Boolean).join("\n"),
      metadata: { treeId: task.tree.id, nodeId: node.id, taskId: task.id, type: node.type },
    }))
  );

  return [...mainDocuments, ...sideDocuments];
}

const assistantSeed = `You are TarkovCompanion, a concise and reliable Escape from Tarkov quest assistant.
Use the supplied task context when relevant. Do not invent quest steps or claim unsupported details as fact. If the context does not answer the question, say what is missing and ask a focused follow-up. Keep instructions practical and easy to follow.`;

export const chatBackend: ChatBackend = async ({ message, history }) => {
  if (!message.trim()) return "Tell me what you are trying to find.";

  const documents = buildTaskDocuments();
  const contextDigest = await retrieveRagContext(message, documents);
  const { data, error } = await getSupabaseClient().functions.invoke<{ reply: string }>(
    "tarkov-chat",
    {
      body: {
        action: "answer",
        message,
        history: history.slice(-12).map(({ role, text }) => ({ role, content: text })),
        seed: assistantSeed,
        context: contextDigest,
      },
    }
  );

  if (error) {
    throw new Error(`Chat function failed: ${await getSupabaseFunctionError(error)}`);
  }
  if (!data?.reply) throw new Error("Chat function returned an empty response.");
  return data.reply;
};