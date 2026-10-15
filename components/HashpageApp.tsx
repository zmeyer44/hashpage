'use client';

// The editor and reader. Semantic HTML on the left, the reader's theme on the right, the link in the header.
// The document lives in the URL fragment (#z. / #v.), or in a /p/ path when the author opts into previews.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type KeyboardEvent } from 'react';
import { byteLength, decode, encode, hasZip } from '@/lib/codec';
import { sanitize } from '@/lib/sanitize';
import { STARTER } from '@/lib/starter';
import { THEMES, THEME_KEY } from '@/lib/themes';
import { IconCheck, IconChevronDown, IconCopy, IconExternal, IconGitHub, IconPencil, IconPlus, IconUpload, IconWarning } from './icons';
import { LogoMark } from './Logo';

const PATH_RE = /^\/p\/([zvt]\.[A-Za-z0-9_-]+)\/?$/;
// Preview links carry the payload in the path. Vercel returns 502 somewhere past ~8,000 characters
// (measured Oct 2026), and the og:image URL adds ~35 more, so this matches the "chat apps and email" band.
const PREVIEW_MAX = 8000;

type Pane = 'editPane' | 'previewPane';
type Level = 'ok' | 'warn' | 'bad';
type Tone = 'success' | 'error';

// Pragmatic bands, not a spec: SMS, chat and email, browsers only, then anything goes.
const FILL: Record<Level, string> = { ok: 'var(--ds-green-700)', warn: 'var(--ds-amber-700)', bad: 'var(--ds-red-700)' };

function verdict(len: number): { cls: Level; text: string; pct: number } {
  if (len <= 2000) return { cls: 'ok', text: 'fits anywhere, even SMS', pct: (len / 2000) * 25 };
  if (len <= 8000) return { cls: 'ok', text: 'fine for chat apps and email', pct: 25 + ((len - 2000) / 6000) * 25 };
  if (len <= 32000) return { cls: 'warn', text: 'browsers only; some apps truncate', pct: 50 + ((len - 8000) / 24000) * 25 };
  return { cls: 'bad', text: 'may not survive sharing', pct: Math.min(100, 75 + ((len - 32000) / 64000) * 25) };
}

function previewDoc(themeKey: string, html: string) {
  const t = THEMES[themeKey] || THEMES.reader;
  return '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' + t.css + '</style>' + html;
}

// The reader's theme lives on their device (never in a link), shared across tabs via the storage event.
// memTheme keeps the choice working when storage is unavailable.
let memTheme = 'reader';
const themeListeners = new Set<() => void>();
function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t && THEMES[t]) return t;
  } catch { /* storage may be unavailable */ }
  return memTheme;
}
function writeTheme(t: string) {
  memTheme = THEMES[t] ? t : 'reader';
  try { localStorage.setItem(THEME_KEY, memTheme); } catch { /* ignore */ }
  themeListeners.forEach((l) => l());
}
function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  window.addEventListener('storage', cb);
  return () => { themeListeners.delete(cb); window.removeEventListener('storage', cb); };
}
const noSubscribe = () => () => {};

function newDocument() {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  return `<title>Untitled</title>\n<article>\n  <header>\n    <h1>Hello</h1>\n    <p><time datetime="${iso}">Today</time></p>\n  </header>\n  <p>Write semantic HTML on the left. Headings, lists, tables, <code>dl</code>, <code>details</code>, <code>aside</code>, <code>figure</code>, <code>mark</code>, <code>time</code>, <code>meter</code>. Styles and scripts are dropped before the link is made.</p>\n</article>\n`;
}

export default function HashpageApp() {
  const [source, setSource] = useState('');
  const [html, setHtml] = useState('');
  const [stripped, setStripped] = useState(0);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'reader');
  const origin = useSyncExternalStore(noSubscribe, () => location.origin, () => '');
  const zip = useSyncExternalStore(noSubscribe, hasZip, () => true);
  // null until the link has been read; the inline boot script owns html.reader until then.
  const [reader, setReader] = useState<boolean | null>(null);
  const [frag, setFrag] = useState('');
  const [pane, setPane] = useState<Pane>('editPane');
  const [toast, setToast] = useState<{ msg: string; tone: Tone; show: boolean }>({ msg: '', tone: 'success', show: false });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const lastHash = useRef('');
  const editTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string, tone: Tone = 'success') => {
    setToast({ msg, tone, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 1600);
  }, []);

  const applySource = useCallback((src: string, replaceEditor: boolean) => {
    const r = sanitize(src);
    setHtml(r.html);
    setStripped(r.stripped);
    if (replaceEditor) setSource(r.html);
  }, []);

  // Boot: read the document from a /p/ path or the fragment, or start with the sample.
  useEffect(() => {
    (async () => {
      const m = PATH_RE.exec(location.pathname);
      let loaded = null;
      try { loaded = await decode(m ? m[1] : location.hash); } catch { loaded = null; }
      if (loaded) {
        setReader(loaded.mode === 'v');
        applySource(loaded.html, true);
      } else {
        setReader(false);
        if (m || location.hash.length > 1) showToast('Could not read that link; starting fresh', 'error');
        applySource(STARTER, true);
      }
    })();
  }, [applySource, showToast]);

  // A fragment changed from outside (pasted link, back button): load it.
  useEffect(() => {
    const onHash = async () => {
      const h = location.hash.replace(/^#/, '');
      if (h === lastHash.current) return;
      try {
        const l = await decode(h);
        if (l) {
          if (l.mode === 'v') setReader(true);
          applySource(l.html, true);
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [applySource]);

  useEffect(() => {
    if (reader !== null) document.documentElement.classList.toggle('reader', reader);
  }, [reader]);

  // Keep the edit link current. Readers keep the address they arrived on until they choose to edit.
  useEffect(() => {
    if (reader === null) return;
    let stale = false;
    encode(html, false).then((f) => {
      if (stale) return;
      lastHash.current = f;
      setFrag(f);
      if (!reader) {
        try { history.replaceState(history.state, '', '/#' + f); } catch { /* rate-limited or unavailable */ }
      }
    });
    return () => { stale = true; };
  }, [html, reader]);

  function onEdit(value: string) {
    setSource(value);
    clearTimeout(editTimer.current);
    editTimer.current = setTimeout(() => applySource(value, false), 220);
  }

  function onEditorKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = e.currentTarget;
    ta.setRangeText('  ', ta.selectionStart, ta.selectionEnd, 'end');
    onEdit(ta.value);
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(label + ' copied');
    } catch {
      const input = linkRef.current;
      if (input) { input.value = text; input.focus(); input.select(); }
      showToast('Select the link and copy it', 'error');
    }
  }

  const copyEdit = async () => copyText(location.origin + '/#' + (await encode(html, false)), 'Edit link');
  const copyReader = async () => copyText(location.origin + '/#' + (await encode(html, true)), 'Reader link');
  const copyPreview = async () => {
    const url = location.origin + '/p/' + (await encode(html, true));
    if (url.length > PREVIEW_MAX) {
      showToast('Too long for a preview link; copy the reader link instead', 'error');
      return;
    }
    copyText(url, 'Preview link');
  };

  function openFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => { applySource(String(r.result), true); showToast('Loaded ' + f.name); };
    r.readAsText(f);
    e.target.value = '';
  }

  const link = frag ? origin + '/#' + frag : '';
  const v = verdict(link.length);

  const themeSelect = (
    <label className="select">
      <span className="label sm-hide">Theme</span>
      <select aria-label="Viewer theme" value={theme} onChange={(e) => writeTheme(e.target.value)}>
        {Object.keys(THEMES).map((k) => <option key={k} value={k}>{THEMES[k].name}</option>)}
      </select>
      <span className="chevron"><IconChevronDown /></span>
    </label>
  );

  return (
    <>
      <header className="top">
        <div className="bar">
          <div className="brand">
            <LogoMark size={24} />
            <h1 className="wordmark">Hashpage</h1>
            <span className="tag">The link carries meaning. Your client carries the look.</span>
          </div>
          <div className="actions">
            {themeSelect}
            <button className="btn btn-secondary" type="button" onClick={() => { applySource(newDocument(), true); editorRef.current?.focus(); }}><IconPlus />New</button>
            <label className="btn btn-secondary"><IconUpload />Open File<input type="file" accept=".html,.htm,text/html" onChange={openFile} /></label>
            <a className="btn btn-secondary" href={link || '#'} target="_blank" rel="noopener"><span className="sm-hide">Open in Tab</span><IconExternal /></a>
            <span className="divider" aria-hidden="true" />
            <button className="btn btn-secondary" type="button" onClick={copyPreview} title="Puts the page in the link's path so chat apps can show a preview card. Unlike # links, the server sees the page."><span><span className="sm-hide">Copy </span>Preview Link</span></button>
            <button className="btn btn-secondary" type="button" onClick={copyReader}><span><span className="sm-hide">Copy </span>Reader Link</span></button>
            <button className="btn btn-primary" type="button" onClick={copyEdit}><span><span className="sm-hide">Copy </span>Edit Link</span></button>
          </div>
          <a className="btn btn-tertiary btn-icon repo" href="https://github.com/zmeyer44/hashpage" target="_blank" rel="noopener" aria-label="Hashpage on GitHub"><IconGitHub /></a>
        </div>
        <div className="field">
          <label className="prefix" htmlFor="linkOut">Link</label>
          <input id="linkOut" ref={linkRef} readOnly spellCheck={false} value={link} onFocus={(e) => e.currentTarget.select()} />
          <button className="btn btn-tertiary btn-tiny btn-icon" type="button" aria-label="Copy link" onClick={() => copyText(linkRef.current?.value || link, 'Link')}><IconCopy /></button>
        </div>
        <div className="gauge">
          <div className="stats">
            <span>HTML <b>{byteLength(html).toLocaleString()}</b> B</span>
            <span>deflated <b>{frag ? Math.floor(((frag.length - 2) * 3) / 4).toLocaleString() : 0}</b> B</span>
            <span>link <b>{link.length.toLocaleString()}</b> chars</span>
          </div>
          <span className={'badge ' + v.cls}>{v.text}</span>
          <div className="progress" role="meter" aria-label="Link length" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v.pct)}>
            <div style={{ width: v.pct + '%', background: FILL[v.cls] }} />
          </div>
        </div>
        <div className="switch" role="tablist" aria-label="Pane">
          {(['editPane', 'previewPane'] as const).map((p) => (
            <button key={p} type="button" role="tab" aria-selected={pane === p} aria-controls={p} onClick={() => setPane(p)}>{p === 'editPane' ? 'Edit' : 'Preview'}</button>
          ))}
        </div>
      </header>

      <main>
        <section className={'pane' + (pane === 'editPane' ? ' active' : '')} id="editPane">
          <div className="pane-head">
            <span>
              <span className="title">Semantic HTML</span>
              {stripped ? <span className="meta warn">{stripped} presentational {stripped === 1 ? 'thing' : 'things'} dropped</span> : null}
            </span>
            <button className="btn btn-tertiary btn-tiny" type="button" onClick={() => copyText(html, 'HTML')}><IconCopy />Copy HTML</button>
          </div>
          <textarea id="editor" ref={editorRef} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="HTML source" value={source} onChange={(e) => onEdit(e.target.value)} onKeyDown={onEditorKey} />
        </section>
        <section className={'pane' + (pane === 'previewPane' ? ' active' : '')} id="previewPane">
          <div className="pane-head">
            <span className="title">Preview</span>
            <span className="meta">{zip ? 'Theme is yours, not in the link' : 'Theme is yours, not in the link · no compression in this browser'}</span>
          </div>
          <iframe id="preview" sandbox="allow-popups" title="Rendered page" srcDoc={previewDoc(theme, html)} />
        </section>
      </main>

      <div id="readerBar">
        {/* A full load on purpose: a soft navigation from /#v.… to / would keep the reader's document on screen. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="btn btn-tertiary btn-icon" href="/" aria-label="About Hashpage"><LogoMark size={20} /></a>
        {themeSelect}
        <button className="btn btn-primary" type="button" onClick={() => setReader(false)}><IconPencil />Edit This Page</button>
      </div>
      <div className={'toast ' + toast.tone + (toast.show ? ' show' : '')} role="status" aria-live="polite">
        {toast.tone === 'success' ? <IconCheck /> : <IconWarning />}
        <span>{toast.msg}</span>
      </div>
    </>
  );
}
