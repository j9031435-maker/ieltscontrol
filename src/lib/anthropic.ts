import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as { anthropic?: Anthropic };

// Constructed lazily (only when a route handler actually calls this) so that
// a missing ANTHROPIC_API_KEY does not throw during module import — the
// Anthropic SDK throws eagerly in its constructor, and Next.js imports every
// route module while building, which would otherwise break the whole build.
export function getAnthropicClient(): Anthropic {
  if (!globalForAnthropic.anthropic) {
    globalForAnthropic.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return globalForAnthropic.anthropic;
}

export const CLAUDE_MODEL = "claude-sonnet-5";
