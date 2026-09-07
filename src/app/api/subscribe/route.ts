import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { checkRateLimit } from '@/lib/rate-limit';

// Basic, permissive email shape — real validation is the confirmation email
// (added when a sending provider is wired in).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_SOURCES = new Set(['footer', 'home', 'packs', 'docs']);

export async function POST(req: NextRequest) {
  const { allowed } = await checkRateLimit(req, 'subscribe', 10, undefined, 60 * 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many attempts — try again later.' },
      { status: 429 },
    );
  }

  let body: { email?: unknown; source?: unknown; interest?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const source =
    typeof body.source === 'string' && VALID_SOURCES.has(body.source) ? body.source : 'unknown';
  const interest =
    typeof body.interest === 'string' ? body.interest.slice(0, 80) : undefined;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const key = `newsletter:${email}`;
    const existing = await env.KV.get(key);
    if (!existing) {
      await env.KV.put(
        key,
        JSON.stringify({
          email,
          source,
          interest,
          ip: req.headers.get('cf-connecting-ip') ?? null,
          ts: Math.floor(Date.now() / 1000),
        }),
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not save your email — try again.' }, { status: 500 });
  }
}
