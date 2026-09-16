import "dotenv/config";

const aiApiKey = process.env.AI_API_KEY;

if (!aiApiKey) {
  throw new Error("AI_API_KEY is not configured");
}

export const aiConfig = {
  apiKey: aiApiKey,
  model: process.env.AI_MODEL ?? "gemini-2.0-flash",
} as const;
