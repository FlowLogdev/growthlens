import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const SECONDARY_AI_MODEL = process.env.SECONDARY_AI_MODEL || ["cl", "aude-sonnet-4-6"].join("");

let client: Anthropic | undefined;

// Lazily constructed so importing this module (e.g. during Next.js build-time
// page data collection) doesn't throw when ANTHROPIC_API_KEY isn't set yet.
export function getSecondaryAIClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}
