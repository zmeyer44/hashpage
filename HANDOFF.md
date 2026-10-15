# Hashpage — handoff

You are picking up a small, working project. Read this whole file, then read `index.html` top to bottom before changing anything. It is one file, about 500 lines, no build step, no dependencies beyond two Google Fonts.

## What it is

Hashpage is a document format and a reference client for it. A document is semantic HTML (no styles, no scripts, no classes), compressed with deflate, base64url-encoded, and carried in the URL fragment after `#`. Whoever has the link has the document. The reader's client, not the author, decides what it looks like: the client ships several "themes," each a classless stylesheet that styles bare elements, and the reader's choice is stored on their device and never enters a link.

It descends from Paul Ford's Tiny Little Office (tinylittleoffice.com, MIT, Oct 2026), which stores documents in the URL as structured data. Hashpage's two departures are: the payload is HTML, and the payload is restricted to semantics so that themes can be opinionated without breaking documents. The analogy we keep coming back to: Markdown won because you cannot style it; semantic HTML is Markdown with a real vocabulary.

## Current state of `index.html`

Everything is in one file so it runs from `file://`, from any static host, and inside a claude.ai artifact. Keep it that way for the client itself; a repo may grow around it, but the shippable client stays a single self-contained HTML file.

**Link format.** `#<prefix>.<base64url>`. Prefixes: `z.` deflated, opens in editor; `v.` deflated, opens in reader mode; `t.` uncompressed fallback. Parsed by the regex `/^#?([zvt])\.([A-Za-z0-9_-]+)$/`. The payload alphabet must stay exactly letters, digits, `-`, `_` with `.` as the one separator. This is not aesthetic: the claude.ai artifact viewer only passes fragments through to the page if they contain nothing but `[A-Za-z0-9._~-]`. Do not add `=`, `/`, `+`, or `?`-style parameters to the fragment.

**Encoding.** `TextEncoder` → `CompressionStream('deflate-raw')` → base64url without padding. Decoding is the reverse with `DecompressionStream`. If `CompressionStream` is absent, the client writes `t.` links and still reads `z.`/`v.` links fail-safe (it will show "could not read that link"). Functions: `deflate`, `inflate`, `b64u`, `unb64u`, `encode(html, reader)`, `decode(hash)`.

**Sanitizer** (`sanitize(src)`). Runs on every edit before encoding, so the link only ever carries sanitized markup. Uses `DOMParser`. Removes elements: `style script link iframe object embed template noscript svg canvas font center`. Removes attributes: anything starting with `on`, plus `style class width height bgcolor color align valign border cellpadding cellspacing face size`, plus `href`/`src` with a `javascript:` scheme. Keeps `id`, `href`, `datetime`, `data-*`, and everything else. Returns `{ html, stripped }`; `html` is `<title>…</title>` (if present) plus `body.innerHTML`. The editor header shows the stripped count. If you change the drop lists, update the "Vocabulary" section of the starter document to match.

**Themes** (`THEMES` object). Keys: `reader`, `terminal`, `brutalist`, `newsprint`, `none`. Each is `{ name, css }`. The CSS must style bare elements only and must handle every element in the starter document's vocabulary table. The chosen key is saved in `localStorage` under `hashpage.theme` (wrapped in try/catch; storage may be unavailable). Rendering: `preview.srcdoc = doctype + metas + <style>theme.css</style> + html`. The iframe is `sandbox="allow-popups"`; scripts are not allowed and must not be, since the sanitizer is the second line of defense, not the first.

**UI.** Header: brand, theme select, New, Open file, Open in tab, Copy reader link, Copy edit link; a readonly link bar with Copy; a size gauge (HTML bytes, deflated bytes, link length, verdict). Main: editor `<textarea>` left, preview iframe right; stacks to tabs under 760px. Reader mode (`body.reader`, entered via a `v.` link) hides the editor and header and shows a floating bar with a theme select and "Edit this page," which switches back to `z.` and reveals the editor. Toast for copy feedback; clipboard failure falls back to selecting the link bar. `history.replaceState` keeps the address bar current; a `hashchange` listener reloads the document if the fragment changes externally.

**Size verdicts.** ≤2,000 chars "fits anywhere, even SMS"; ≤8,000 "fine for chat apps and email"; ≤32,000 "browsers only; some apps truncate"; above that "may not survive sharing." These are pragmatic, not sourced from a spec. If you refine them, keep the four-band shape.

**Starter document** (`STARTER`). A wiki-style article about Hashpage itself, using every element in the vocabulary. It is the test fixture for themes: if a theme renders the starter well in all sections, it is done. Measured on handoff: 7,495 bytes of source, 2,877 deflated, ~3,900-character link. The `<meter>` in its Limits section hard-codes that number; update it if the starter changes materially.

## Conventions

- Vanilla JS, no framework, no bundler for the client. ES2020 is fine.
- Design tokens live in `:root` at the top of the `<style>` block and must be defined for light, `prefers-color-scheme: dark`, and `[data-theme="dark"]` (the artifact viewer sets the attribute). Do not introduce literal colors in component rules.
- The page must work at 400px width with no horizontal scroll, and must stay complete at rest (no content hidden until scroll or interaction).
- The host page's theme (the editor chrome) and the document themes (inside the iframe) are separate systems. Don't let one leak into the other.
- Before publishing a change, run a syntax check on the inline script and a deflate round-trip on the starter. Both were done with Node 22 on handoff; a one-line script for each is in the "Verification" section below.

## What to work on, in rough priority

1. **Repo and tests.** Put `index.html` in a repo with a `README.md`, an MIT `LICENSE`, and a `package.json` whose only job is tests. Extract the pure functions (`b64u`, `unb64u`, `encode`, `decode`, `sanitize`) into a module the HTML inlines at build time, or keep them in the HTML and test them by extracting the script with a regex, whichever stays simplest. Tests to write: base64url round-trip including bytes ≥0x80 and lengths 0–3 mod 4; deflate round-trip on the starter and on a 100 KB document; sanitizer drops every item in both drop lists and keeps `id`, `href`, `datetime`, `data-*`; sanitizer neutralizes `javascript:` hrefs; `decode` rejects malformed prefixes. Add one Playwright smoke test: load the page, confirm the starter renders, change the theme, confirm the fragment did not change.

2. **Theme-as-link.** A theme is a bare-element stylesheet, so it fits in a fragment too. Add an `s.` prefix for a deflated stylesheet. UX: a theme link opens the client with that theme applied and offers "Keep this theme," which stores the CSS under a user-chosen name in localStorage and adds it to both theme selects. Sanitize imported CSS: reject `@import`, `url(`, `expression(`, and anything targeting the host page (there is no host page inside the iframe, but be strict anyway). A theme link must never carry a document, and a document link must never carry a theme; keep the two prefixes disjoint.

3. **Vocabulary extensions via `data-*`.** HTML lacks a semantic hook for a few things authors will want: callout level (`<aside data-kind="warning">`), slide breaks, and a fact box. Define a small, documented set of `data-kind` values, have at least the Reader and Brutalist themes interpret them, and let other themes ignore them. Add the set to the starter's Vocabulary section. Do not add new elements or allow `class`.

4. **QR export.** Load `qrcode-generator` from cdnjs (pin an exact version), render the current link as a QR in a modal, and show the version/size so authors can see when a page outgrows what a phone camera reads comfortably (alphanumeric mode will not apply because of lowercase; expect byte mode, roughly 2,900 characters at version 40-L, practically far fewer).

5. **Agent on-ramp.** Add `llms.txt` describing the format in one page, and a tiny CLI, `npx hashpage encode page.html [--reader] [--base https://host/]`, that prints a link, plus `npx hashpage decode <link>` that prints the HTML. Both share the sanitizer so an agent cannot produce a link the client would strip differently. Then a `SKILL.md` for coding agents that says: write semantic HTML from the vocabulary table, run `encode`, hand the user the link.

6. **Editor quality of life.** Element insert menu (one click to insert a `<details>` or `<dl>` skeleton); lint warnings in the editor header for heading levels that skip, tables without `<thead>`, `<time>` without `datetime`; "Format" button that pretty-prints the sanitized HTML back into the textarea. Keep syntax highlighting out unless it can be done without a library.

7. **Optional short links.** Only if asked. The pattern is Tiny Little Office's: the browser encrypts the payload with a random key, posts ciphertext to a tiny worker, and the key goes after `#` in the short link so the server never sees content. If you build this, it must be an opt-in button, documents must keep working without it, and links must expire.

## Known issues

- Safari does not reliably support `summary::marker { content: … }`, so the Terminal theme's `[+]`/`[-]` markers may not show there. A `summary::before` fallback would fix it.
- The Newsprint drop cap selector targets the first `<p>` in the first `<section>` or directly inside `<article>`; documents that open with an `<aside>` will put the drop cap in an odd place. Consider restricting it to `article > p:first-of-type`.
- `history.replaceState` is called on every debounced edit. Some browsers rate-limit this (Safari: ~100 per 30 s). It has not caused a visible problem but a longer debounce or a "dirty → sync on idle" strategy would be safer.
- Inside a claude.ai artifact the base URL is the artifact URL, which is private until shared. The standalone file is the version to host.

## Verification

Syntax check of the inline script (Node 22+):

```sh
node -e "const s=require('fs').readFileSync('index.html','utf8');const i=s.indexOf('<script>\n(function');new Function(s.slice(i+8,s.lastIndexOf('</script>')));console.log('ok')"
```

Starter round-trip and size:

```sh
node -e "
const s=require('fs').readFileSync('index.html','utf8');
const st=/const STARTER = \`([\s\S]*?)\`;/.exec(s)[1];
(async()=>{const enc=new TextEncoder(),dec=new TextDecoder();
const cs=new CompressionStream('deflate-raw');let w=cs.writable.getWriter();w.write(enc.encode(st));w.close();
const b=new Uint8Array(await new Response(cs.readable).arrayBuffer());
const ds=new DecompressionStream('deflate-raw');w=ds.writable.getWriter();w.write(b);w.close();
const back=dec.decode(await new Response(ds.readable).arrayBuffer());
console.log('bytes',enc.encode(st).length,'deflated',b.length,'link~',Math.ceil(b.length*4/3)+2+60,'roundtrip',back===st);})();"
```

## Things not to do

- Do not put the theme, or any viewer preference, into the link.
- Do not allow scripts in documents, in themes, or in the preview sandbox, whatever the justification.
- Do not add a server to the core path. The client must work with the HTML file alone.
- Do not change what an existing prefix means. Add a new prefix and keep reading the old ones.
- Do not reintroduce `class` or `style` as an escape hatch. `data-*` is the escape hatch.
