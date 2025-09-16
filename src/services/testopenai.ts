import OpenAI from "openai";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY!;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const response = openai.responses.create({
  model: "gpt-4o",
  input: "write a haiku about ai",
  store: true,
});

response.then((result) => console.log(result.output_text));