export const SUBSCRIBER_COOKIE = 'fd_sub';

// 90-day hard stop; real revocation happens via the KV re-validation in
// lib/subscription.ts, not this expiry.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

export interface SubscriberPayload {
  cid: string;
  iat: number;
  exp: number;
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

export async function signSubscriberCookie(customerId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SubscriberPayload = { cid: customerId, iat: now, exp: now + MAX_AGE_SECONDS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySubscriberCookie(
  raw: string,
  secret: string,
): Promise<SubscriberPayload | null> {
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
    ) as SubscriberPayload;
    if (
      typeof payload.cid !== 'string' ||
      typeof payload.exp !== 'number' ||
      typeof payload.iat !== 'number'
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

const COOKIE_ATTRS = 'HttpOnly; Secure; SameSite=Lax; Path=/';

export function buildSetCookie(value: string): string {
  return `${SUBSCRIBER_COOKIE}=${value}; ${COOKIE_ATTRS}; Max-Age=${MAX_AGE_SECONDS}`;
}

export function buildClearCookie(): string {
  return `${SUBSCRIBER_COOKIE}=; ${COOKIE_ATTRS}; Max-Age=0`;
}
