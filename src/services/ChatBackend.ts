import { mainTree } from "./TreeBackend";
import { sideTaskDefinitions } from "./SideTasksBackend";

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
  documents: RagDocument[];
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

export function getPlaceholderReply(message: string): string {
  if (message.trim().length === 0) return "Tell me what you are trying to find.";
  return "I am connected to the task assistant UI. The RAG response service will be added here next.";
}

export const chatBackend: ChatBackend = async ({ message }) => getPlaceholderReply(message);