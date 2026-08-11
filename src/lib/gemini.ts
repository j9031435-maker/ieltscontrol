import { GoogleGenerativeAI } from "@google/generative-ai";

const globalForGemini = globalThis as unknown as { gemini?: GoogleGenerativeAI };

// Constructed lazily so that a missing GEMINI_API_KEY doesn't throw during
// module import — Next.js imports every route module while building, and an
// eager throw there would break the whole build (see the Anthropic client
// bug this replaced).
function getClient(): GoogleGenerativeAI {
  if (!globalForGemini.gemini) {
    globalForGemini.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return globalForGemini.gemini;
}

// Alias that always resolves to Google's current recommended Flash model,
// so this doesn't need to be bumped by hand as model generations roll over.
export const GEMINI_MODEL = "gemini-flash-latest";

// Model instance configured to always return raw JSON (no markdown fences),
// per the official Gemini JSON-mode support. `maxOutputTokens` is raised for
// bulk content generation, where one response holds several long passages.
export function getGeminiJsonModel(systemInstruction: string, maxOutputTokens?: number) {
  return getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      ...(maxOutputTokens ? { maxOutputTokens } : {}),
    },
  });
}

/** Gemini's free tier allows only 5 requests/minute — surfaced to admins as-is. */
export function isQuotaError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.toLowerCase().includes("quota");
}
