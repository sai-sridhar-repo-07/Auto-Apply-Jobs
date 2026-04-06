/**
 * AI provider wrapper — supports Anthropic and OpenRouter.
 *
 * Set in .env.local:
 *   AI_PROVIDER=anthropic   → uses ANTHROPIC_API_KEY  (default)
 *   AI_PROVIDER=openrouter  → uses OPENROUTER_API_KEY
 *
 * All other code imports `ask` and `stream` from here — no changes needed elsewhere.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ── Provider detection ────────────────────────────────────────────────────────

const PROVIDER = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

export const isOpenRouter = PROVIDER === "openrouter";

// Best free model on OpenRouter for structured JSON output (as of 2025)
// Override with OPENROUTER_MODEL in .env.local
const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

export const MODEL = isOpenRouter ? OPENROUTER_MODEL : "claude-sonnet-4-6";

// ── Clients (lazy-initialized) ────────────────────────────────────────────────

let _anthropic: Anthropic | null = null;
let _openrouter: OpenAI | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set in .env.local");
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
}

function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY is not set in .env.local");
    _openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: key,
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/sai-sridhar-repo-07/Auto-Apply-Jobs",
        "X-Title": "JobCraft",
      },
    });
  }
  return _openrouter;
}

// ── ask() — single response ───────────────────────────────────────────────────

export async function ask(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 4096
): Promise<string> {
  if (isOpenRouter) {
    const client = getOpenRouter();
    const res = await client.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }

  // Anthropic
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

// ── stream() — streaming response ────────────────────────────────────────────

export async function* stream(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8192
): AsyncGenerator<string> {
  if (isOpenRouter) {
    const client = getOpenRouter();
    const s = await client.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });
    for await (const chunk of s) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
    return;
  }

  // Anthropic
  const client = getAnthropic();
  const s = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  for await (const event of s) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

// keep old export name for any direct imports
export { getAnthropic as getClient };
