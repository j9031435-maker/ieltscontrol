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

export const GEMINI_MODEL = "gemini-2.0-flash";

// Model instance configured to always return raw JSON (no markdown fences),
// per the official Gemini JSON-mode support.
export function getGeminiJsonModel(systemInstruction: string) {
  return getClient().getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}
