import { createAnthropic } from '@ai-sdk/anthropic';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { ChatUIMessage, SearchTool } from '@/components/ai/search';
import { checkRateLimit } from '@/lib/rate-limit';
import { checkSubscriber } from '@/lib/subscription';
import {
  AI_ROUTE_KEY,
  AI_ROUTE_KEY_SUB,
  AI_FREE_LIMIT,
  AI_SUBSCRIBER_LIMIT,
  AI_WINDOW_SECONDS,
  AI_FREE_LIMIT_MESSAGE,
  AI_SUBSCRIBER_LIMIT_MESSAGE,
} from '@/lib/ai-limits';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}
const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description ?? '',
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = [
  'You are the assistant for fabdocs.dev — a production engineering manual for',
  'Microsoft Fabric (OneLake, Delta Lake, notebooks/PySpark, CI/CD, governance,',
  'capacity/CU cost). Be precise, concise, and correctness-first. This site is',
  "about *how* to run Fabric in production, not a feature tour — answer in that spirit.",
  '',
  'ALWAYS call the `search` tool before answering anything non-trivial, and ground',
  'your answer in what it returns. Cite the pages you used as markdown links using',
  "each result's `url`, e.g. [Delta table optimization](/docs/onelake/delta-optimization).",
  'If search finds nothing relevant, say so and suggest a better query rather than guessing.',
  '',
  'When you give code:',
  '- Use a fenced block with the right language (```python, ```sql, ```bash, ```yaml).',
  '- Prefer PySpark / Delta / T-SQL idioms that match the docs.',
  '- Say *why* — the failure mode, the CU cost implication, the safer form.',
  '',
  'Call out Capacity Unit (CU) impact whenever a technique changes cost. If the user',
  'pastes an error, diagnose the root cause first, then give a corrected version.',
].join('\n');

export async function POST(req: NextRequest, _ctx: RouteContext<'/api/chat'>) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI is not configured: ANTHROPIC_API_KEY is missing on the server.' },
      { status: 503 },
    );
  }

  const subscriber = await checkSubscriber(req);
  const { allowed } = subscriber.isSubscriber
    ? await checkRateLimit(
        req,
        AI_ROUTE_KEY_SUB,
        AI_SUBSCRIBER_LIMIT,
        subscriber.customerId,
        AI_WINDOW_SECONDS,
      )
    : await checkRateLimit(req, AI_ROUTE_KEY, AI_FREE_LIMIT, undefined, AI_WINDOW_SECONDS);

  if (!allowed) {
    const message = subscriber.isSubscriber
      ? AI_SUBSCRIBER_LIMIT_MESSAGE
      : AI_FREE_LIMIT_MESSAGE;
    const res = Response.json({ error: message }, { status: 429 });
    if (subscriber.setCookieHeader) res.headers.append('Set-Cookie', subscriber.setCookieHeader);
    return res;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- request body is the AI SDK's UIMessage[], validated by convertToModelMessages
  const reqJson: any = await req.json();

  const result = streamText({
    model: anthropic(process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'),
    system: systemPrompt,
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    messages: await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    }),
    toolChoice: 'auto',
  });

  const response = createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error('[api/chat]', error);
        if (error == null) return 'Unknown error';
        if (typeof error === 'string') return error;
        if (error instanceof Error) return error.message;
        return JSON.stringify(error);
      },
    }),
  });

  if (subscriber.setCookieHeader) response.headers.append('Set-Cookie', subscriber.setCookieHeader);
  return response;
}

const searchTool = tool({
  description: 'Search the fabdocs.dev docs content and return raw JSON results.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    return await search.searchAsync(query, { limit, merge: true, enrich: true });
  },
}) satisfies SearchTool;
