// Encoding: utf8 -> deflate-raw -> base64url. The prefix tells the loader how to read the payload.
// z. = deflated, opens in the editor   v. = deflated, opens in reader mode   t. = uncompressed (fallback)
// The payload alphabet is letters, digits, '-' and '_', with '.' as the one separator. The same payload
// works after '#' (private: never sent to a server) or in a /p/ path (preview: the server reads it).

export type Mode = 'z' | 'v' | 't';
export type Decoded = { html: string; mode: Mode };

const PAYLOAD_RE = /^#?([zvt])\.([A-Za-z0-9_-]+)$/;

const enc = new TextEncoder();
const dec = new TextDecoder();

export const hasZip = () => typeof CompressionStream === 'function';

export function byteLength(str: string): number {
  return enc.encode(str).length;
}

async function readAll(stream: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new Error('payload too large');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, maxBytes = Infinity) {
  const w = stream.writable.getWriter();
  // Corrupt input rejects both the write and the read; the read reports it, so keep these quiet.
  w.write(bytes as Uint8Array<ArrayBuffer>).catch(() => {});
  w.close().catch(() => {});
  return readAll(stream.readable, maxBytes);
}

export function deflate(str: string): Promise<Uint8Array> {
  return pipe(enc.encode(str), new CompressionStream('deflate-raw'));
}

export async function inflate(bytes: Uint8Array, maxBytes = Infinity): Promise<string> {
  return dec.decode(await pipe(bytes, new DecompressionStream('deflate-raw'), maxBytes));
}

export function b64u(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function unb64u(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encode(html: string, reader: boolean): Promise<string> {
  if (hasZip()) return (reader ? 'v.' : 'z.') + b64u(await deflate(html));
  return 't.' + b64u(enc.encode(html));
}

/** Accepts `z.…`, `#z.…`, or the same in a /p/ path segment. Returns null for anything malformed. */
export async function decode(payload: string, maxBytes = Infinity): Promise<Decoded | null> {
  const m = PAYLOAD_RE.exec(payload || '');
  if (!m) return null;
  const mode = m[1] as Mode;
  const bytes = unb64u(m[2]);
  if (mode === 't') {
    if (bytes.length > maxBytes) return null;
    return { html: dec.decode(bytes), mode };
  }
  return { html: await inflate(bytes, maxBytes), mode };
}
