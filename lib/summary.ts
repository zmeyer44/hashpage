// Server-side reading of a /p/ preview payload: decode, sanitize with the same rules as the client,
// and pull out the text a link preview needs. Only text leaves this module; markup is never echoed.

import { cache } from 'react';
import { DOMParser } from 'linkedom';
import { decode } from './codec';
import { sanitizeDocument } from './sanitize';

// Bounds the work a crafted payload can cause: deflate can expand ~1000x.
const MAX_DOC_BYTES = 256 * 1024;

export type Block = { kind: 'h' | 'p' | 'li' | 'quote' | 'pre'; text: string };
export type Summary = { title: string; description: string; lede: string; blocks: Block[]; words: number };

const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,pre,dt,dd,figcaption';
const SKIP = 'nav,footer,table,details,aside,figure';

const squash = (s: string | null | undefined) => (s || '').replace(/\s+/g, ' ').trim();

export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.—–-]+$/, '') + '…';
}

function kindOf(tag: string): Block['kind'] {
  if (/^h\d$/.test(tag)) return 'h';
  if (tag === 'li' || tag === 'dt' || tag === 'dd') return 'li';
  if (tag === 'blockquote') return 'quote';
  if (tag === 'pre') return 'pre';
  return 'p';
}

export const summarize = cache(async (payload: string): Promise<Summary | null> => {
  let html: string;
  try {
    const decoded = await decode(payload, MAX_DOC_BYTES);
    if (!decoded) return null;
    html = decoded.html;
  } catch {
    return null;
  }

  // linkedom only builds a body for whole documents, so wrap the fragment.
  const doc = new DOMParser().parseFromString('<!doctype html><html><head></head><body>' + html + '</body></html>', 'text/html') as unknown as Document;
  sanitizeDocument(doc);

  const titleEl = doc.querySelector('title');
  const h1 = doc.querySelector('h1');
  const title = squash(titleEl?.textContent) || squash(h1?.textContent) || 'Untitled';
  titleEl?.remove();

  const blocks: Block[] = [];
  let lede = '';
  for (const el of Array.from(doc.body.querySelectorAll(BLOCKS))) {
    if (el.closest(SKIP) || el.parentElement?.closest(BLOCKS)) continue;
    const tag = el.tagName.toLowerCase();
    const text = squash(el.textContent);
    if (!text || tag === 'h1') continue;
    if (!lede && !blocks.length && tag === 'p') { lede = text; continue; }
    blocks.push({ kind: kindOf(tag), text });
    if (blocks.length >= 8) break;
  }

  const words = squash(doc.body.textContent).split(' ').filter(Boolean).length;
  const description = clip(lede || blocks.find((b) => b.kind === 'p')?.text || 'A page that lives in its link.', 200);
  return { title, description, lede, blocks, words };
});
