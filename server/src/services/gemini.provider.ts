import { GoogleGenAI } from "@google/genai";

import { aiConfig } from "../config/ai.js";
import { AppError } from "../utils/app-error.js";

import type { AIProvider } from "./ai-provider.js";

const client = new GoogleGenAI({
    apiKey: aiConfig.apiKey,
});

const GEMINI_TIMEOUT_MS = 10_000;

export const geminiProvider: AIProvider = {
    async generateText(prompt: string): Promise<string> {
        let timeoutId: NodeJS.Timeout | undefined;

        try {
            const response = await Promise.race([
                client.models.generateContent({
                    model: aiConfig.model,
                    contents: prompt,
                }),

                new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(
                            new AppError(
                                503,
                                "AI_PROVIDER_TIMEOUT",
                                "AI service request timed out"
                            )
                        );
                    }, GEMINI_TIMEOUT_MS);
                }),
            ]);

            const text = response.text;

            if (!text) {
                throw new AppError(
                    503,
                    "AI_PROVIDER_EMPTY_RESPONSE",
                    "AI service returned an empty response"
                );
            }

            return text;
        } catch (error: unknown) {
            if (error instanceof AppError) {
                throw error;
            }

            console.error(
                "Gemini provider failed:",
                error
            );

            throw new AppError(
                503,
                "AI_PROVIDER_UNAVAILABLE",
                "AI service is temporarily unavailable"
            );
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    },
};