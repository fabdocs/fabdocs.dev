import { NextRequest, NextResponse } from 'next/server';
import { zipSync, strToU8 } from 'fflate';
import { PACKS } from '@/generated/packs';
import { checkSubscriber } from '@/lib/subscription';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/packs/[slug]'>) {
  const { slug } = await ctx.params;
  const pack = PACKS[slug];
  if (!pack) {
    return NextResponse.json({ error: 'Unknown pack.' }, { status: 404 });
  }

  const devUnlock = process.env.PACKS_DEV_UNLOCK === '1';
  const subscriber = await checkSubscriber(req);

  if (!devUnlock && !subscriber.isSubscriber) {
    const res = NextResponse.json(
      { error: 'This pack is included with Pro. Upgrade to download it.', upgrade: '/pricing' },
      { status: 403 },
    );
    if (subscriber.setCookieHeader) res.headers.append('Set-Cookie', subscriber.setCookieHeader);
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
  if (subscriber.setCookieHeader) res.headers.append('Set-Cookie', subscriber.setCookieHeader);
  return res;
}
