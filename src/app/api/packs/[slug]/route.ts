import { NextRequest, NextResponse } from 'next/server';
import { zipSync, strToU8 } from 'fflate';
import { PACKS } from '@/generated/packs';
import { checkPackAccess } from '@/lib/pack-ownership';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/packs/[slug]'>) {
  const { slug } = await ctx.params;
  const pack = PACKS[slug];
  if (!pack) {
    return NextResponse.json({ error: 'Unknown pack.' }, { status: 404 });
  }

  const devUnlock = process.env.PACKS_DEV_UNLOCK === '1';
  const access = await checkPackAccess(req, slug);

  if (!devUnlock && !access.allowed) {
    const res = NextResponse.json(
      {
        error: 'This pack is included with Pro, or available as a one-time purchase.',
        upgrade: '/pricing',
      },
      { status: 403 },
    );
    if (access.setCookieHeader) res.headers.append('Set-Cookie', access.setCookieHeader);
    return res;
  }

  const entries: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(pack.files)) {
    entries[path] = strToU8(content);
  }
  const zipped = zipSync(entries, { level: 6 });

  const res = new NextResponse(zipped as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${pack.zipName}"`,
      'Cache-Control': 'private, no-store',
      'Content-Length': String(zipped.byteLength),
    },
  });
  if (access.setCookieHeader) res.headers.append('Set-Cookie', access.setCookieHeader);
  return res;
}
