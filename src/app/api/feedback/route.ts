import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { checkRateLimit } from '@/lib/rate-limit';

// Docs and blog pages only — this isn't meant for /pricing, /packs, etc.
const PAGE_RE = /^\/(docs|blog)(\/[a-z0-9-]+)*$/;

export async function POST(req: NextRequest) {
  const { allowed } = await checkRateLimit(req, 'feedback', 30, undefined, 60 * 60);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests — try again later.' }, { status: 429 });
  }

  let body: { page?: unknown; vote?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const page = typeof body.page === 'string' ? body.page : '';
  const vote = body.vote === 'yes' || body.vote === 'no' ? body.vote : null;
  if (!PAGE_RE.test(page) || page.length > 200 || !vote) {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const ip = req.headers.get('cf-connecting-ip') ?? 'unknown';

    // One vote per page per IP per month — resettable, not identity-proof,
    // just enough to stop a page's counts being trivially spammed.
    const dedupeKey = `feedback:voted:${page}:${ip}`;
    if (await env.KV.get(dedupeKey)) {
      return NextResponse.json({ ok: true, alreadyVoted: true });
    }
    await env.KV.put(dedupeKey, '1', { expirationTtl: 60 * 60 * 24 * 30 });

    const countKey = `feedback:count:${page}:${vote}`;
    const current = Number((await env.KV.get(countKey)) ?? '0');
    await env.KV.put(countKey, String(current + 1));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not save feedback — try again.' }, { status: 500 });
  }
}
