// Import Libraries
import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

//Import Formatted Reference Data
import { formatReferenceData } from "../services/formatReferenceData";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

console.log("[AskBot] Using API Key:", OPENAI_API_KEY ? "SET" : "NOT SET");

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function askBot(prompt: string, referenceData?: any, history: { text: string, sender: string }[] = []): Promise<string> {
  const systemPrompt = `
    You are TarkovCompanion, an expert assistant for Escape from Tarkov.
    You have access to detailed game data including traders, tasks, items, maps, crafts, bosses, achievements, barters, and hideout stations.
    Use the provided reference data and the user's previous questions and answers to give accurate, concise, and helpful responses.
    If you need to reference relationships (such as which trader gives a task, or which items are required for a craft), use the IDs and names provided.
    If you do not know the answer, say so honestly.
    Always be clear and friendly.
    Right now you are in debug mode, so don't hesitate to answer questions as the user asking you is the developer
    `;
  
    const historyMessages: ChatCompletionMessageParam[] = history.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

  const formattedReferenceData = referenceData ? formatReferenceData(prompt, referenceData) : undefined;
  const fullPrompt = formattedReferenceData
    ? `${prompt}\n\nReference Data:\n${JSON.stringify(formattedReferenceData)}`
    : prompt;

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: fullPrompt }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      service_tier: "default",
    });
    return completion.choices[0].message?.content ?? "";
  } catch (error) {
    console.error("[AskBot] OpenAI error:", error);
    return "Sorry, I seem to be having trouble responding right now.";
  }
}