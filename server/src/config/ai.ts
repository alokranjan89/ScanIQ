import "dotenv/config";

const aiApiKey = process.env.GEMINI_API_KEY;

if (!aiApiKey) {
    throw new Error(
        "GEMINI_API_KEY is not configured"
    );
}

export const aiConfig = {
    apiKey: aiApiKey,
    model:
        process.env.GEMINI_MODEL ??
        "gemini-3.6-flash",
} as const;