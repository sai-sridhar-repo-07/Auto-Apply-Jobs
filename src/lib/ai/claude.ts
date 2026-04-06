import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicKey } from '@/lib/config'

let _client: Anthropic | null = null

export function getClient(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: getAnthropicKey() })
  return _client
}

export const MODEL = 'claude-sonnet-4-6'

export async function ask(systemPrompt: string, userMessage: string, maxTokens = 4096): Promise<string> {
  const client = getClient()
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

export async function* stream(systemPrompt: string, userMessage: string, maxTokens = 8192): AsyncGenerator<string> {
  const client = getClient()
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}
