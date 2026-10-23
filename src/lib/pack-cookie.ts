// A signed Stripe customer-id cookie for one-time pack purchases — separate
// from subscriber-cookie.ts because that cookie's fast path trusts "isSubscriber"
// for 6h on signature alone; reusing it here would let a $49 pack purchase
// accidentally grant the Pro AI limit for that window too.

export const PACK_OWNER_COOKIE = 'fd_pack';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 400; // browser Max-Age cap

interface PackOwnerPayload {
  cid: string;
  iat: number;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signPackOwnerCookie(customerId: string, secret: string): Promise<string> {
  const payload: PackOwnerPayload = { cid: customerId, iat: Math.floor(Date.now() / 1000) };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifyPackOwnerCookie(
  raw: string,
  secret: string,
): Promise<PackOwnerPayload | null> {
  const [payloadB64, sigB64] = raw.split('.');
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(sigB64) as BufferSource,
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(payloadB64)),
    ) as PackOwnerPayload;
    if (typeof payload.cid !== 'string' || typeof payload.iat !== 'number') return null;

    return payload;
  } catch {
    return null;
  }
}

const COOKIE_ATTRS = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export function buildPackOwnerSetCookie(value: string): string {
  return `${PACK_OWNER_COOKIE}=${value}; ${COOKIE_ATTRS}; Max-Age=${MAX_AGE_SECONDS}`;
}
