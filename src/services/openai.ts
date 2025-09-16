import { OpenAI } from "openai";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function askBot(prompt: string, graphData?: any): Promise<string> {
  // Optionally format graphData into the prompt
  const fullPrompt = graphData
    ? `${prompt}\n\nReference Data:\n${JSON.stringify(graphData)}`
    : prompt;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: fullPrompt }],
  });
  return completion.choices[0].message?.content ?? "";
}