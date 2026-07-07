import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

let client: Anthropic | undefined;

// Lazily constructed so importing this module (e.g. during Next.js build-time
// page data collection) doesn't throw when ANTHROPIC_API_KEY isn't set yet.
export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}
