// Link-preview cards, drawn with next/og (Satori). The site card uses the Geist look of the editor;
// document cards follow the Reader theme so a preview looks like the top of the page it links to.
// Satori needs display:flex on any multi-child element.

import { ImageResponse } from 'next/og';
import type { ReactElement, ReactNode } from 'react';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { MARK_FOLD, MARK_HASH, MARK_PAGE } from '@/components/Logo';
import { clip, type Summary } from './summary';

export const OG_SIZE = { width: 1200, height: 630 };

const C = { paper: '#fbf8f2', ink: '#1f1d1a', muted: '#6b655a', rule: '#d8d2c3' };
// Geist dark: background-200, gray-1000, gray-900, gray-alpha-400, blue-900.
const G = { bg: '#000000', fg: '#ededed', muted: '#a1a1a1', rule: '#ffffff24', link: '#50a8ff' };
const SERIF = 'IBM Plex Serif';
const SANS = 'Geist';
const MONO = 'Geist Mono';

type Font = { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' };
let fontsPromise: Promise<Font[]> | null = null;
function fonts(): Promise<Font[]> {
  const load = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
  fontsPromise ??= Promise.all([
    load('ibm-plex-serif-latin-400-normal.woff').then((data): Font => ({ name: SERIF, data, weight: 400, style: 'normal' })),
    load('ibm-plex-serif-latin-600-normal.woff').then((data): Font => ({ name: SERIF, data, weight: 600, style: 'normal' })),
    load('ibm-plex-serif-latin-ext-400-normal.woff').then((data): Font => ({ name: SERIF, data, weight: 400, style: 'normal' })),
    load('ibm-plex-serif-latin-ext-600-normal.woff').then((data): Font => ({ name: SERIF, data, weight: 600, style: 'normal' })),
    load('geist-sans-latin-400-normal.woff').then((data): Font => ({ name: SANS, data, weight: 400, style: 'normal' })),
    load('geist-sans-latin-600-normal.woff').then((data): Font => ({ name: SANS, data, weight: 600, style: 'normal' })),
    load('geist-mono-latin-400-normal.woff').then((data): Font => ({ name: MONO, data, weight: 400, style: 'normal' })),
  ]);
  return fontsPromise;
}

// The logo mark (components/Logo.tsx) as plain SVG; Satori hands it to resvg, which supports masks.
function Mark({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <mask id="m">
        <path fill="#fff" d={MARK_PAGE} />
        <path fill="#000" d={MARK_FOLD} />
        <path stroke="#000" strokeWidth="2.5" d={MARK_HASH} />
      </mask>
      <rect width="32" height="32" fill={color} mask="url(#m)" />
    </svg>
  );
}

function Footer({ right }: { right: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${C.rule}`, paddingTop: 22, fontFamily: MONO, fontSize: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', color: C.ink }}>
        <Mark size={30} color={C.ink} />
        <span style={{ marginLeft: 12 }}>hashpage.dev</span>
      </div>
      <div style={{ display: 'flex', color: C.muted }}>{right}</div>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.paper, color: C.ink, fontFamily: SERIF, padding: '60px 80px 44px' }}>
      {children}
    </div>
  );
}

async function render(node: ReactElement) {
  // A card is a pure function of its URL, so caches may keep it forever.
  return new ImageResponse(node, { ...OG_SIZE, fonts: await fonts(), headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
}

export function siteCard() {
  return render(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: G.bg, color: G.fg, fontFamily: SANS, padding: '72px 80px 48px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Mark size={104} color={G.fg} />
          <div style={{ display: 'flex', marginLeft: 28, fontSize: 112, fontWeight: 600, letterSpacing: -6, lineHeight: 1 }}>Hashpage</div>
        </div>
        <div style={{ display: 'flex', fontSize: 40, color: G.muted, marginTop: 36, lineHeight: 1.3, letterSpacing: -0.8 }}>The link carries meaning. Your client carries the look.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `2px solid ${G.rule}`, paddingTop: 24, fontFamily: MONO, fontSize: 24 }}>
        <div style={{ display: 'flex' }}>
          <span style={{ color: G.fg }}>hashpage.dev/</span>
          <span style={{ color: G.link }}>#v.yXZbBattAEIbv-xQLPRTMxtS…</span>
        </div>
        <div style={{ display: 'flex', color: G.muted }}>semantic HTML in the link</div>
      </div>
    </div>,
  );
}

function BlockView({ kind, text }: Summary['blocks'][number]) {
  if (kind === 'h') return <div style={{ display: 'flex', flexShrink: 0, fontSize: 36, fontWeight: 600, marginTop: 6, marginBottom: 10, lineHeight: 1.2 }}>{clip(text, 70)}</div>;
  if (kind === 'li')
    return (
      <div style={{ display: 'flex', flexShrink: 0, fontSize: 26, lineHeight: 1.45, marginBottom: 6 }}>
        <span style={{ color: C.muted, marginRight: 14 }}>•</span>
        <span>{clip(text, 140)}</span>
      </div>
    );
  if (kind === 'quote') return <div style={{ display: 'flex', flexShrink: 0, fontSize: 26, lineHeight: 1.45, color: C.muted, borderLeft: `4px solid ${C.rule}`, paddingLeft: 20, marginBottom: 16 }}>{clip(text, 220)}</div>;
  if (kind === 'pre') return <div style={{ display: 'flex', flexShrink: 0, fontFamily: MONO, fontSize: 20, lineHeight: 1.5, color: C.muted, marginBottom: 16 }}>{clip(text, 160)}</div>;
  return <div style={{ display: 'flex', flexShrink: 0, fontSize: 26, lineHeight: 1.5, marginBottom: 16 }}>{clip(text, 300)}</div>;
}

export function documentCard(s: Summary) {
  const readMin = Math.max(1, Math.round(s.words / 230));
  return render(
    <Frame>
      <div style={{ display: 'flex', fontSize: s.title.length > 40 ? 56 : 68, fontWeight: 600, letterSpacing: -1, lineHeight: 1.1 }}>{clip(s.title, 80)}</div>
      {s.lede ? <div style={{ display: 'flex', fontSize: 28, color: C.muted, lineHeight: 1.4, marginTop: 18 }}>{clip(s.lede, 150)}</div> : null}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', marginTop: 30, marginBottom: 20 }}>
        {s.blocks.map((b, i) => <BlockView key={i} {...b} />)}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 110, backgroundImage: `linear-gradient(to bottom, rgba(251,248,242,0), ${C.paper})` }} />
      </div>
      <Footer right={`${s.words.toLocaleString('en-US')} words · ${readMin} min read`} />
    </Frame>,
  );
}
