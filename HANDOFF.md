# Hashpage — handoff

You are picking up a small, working project. Read this whole file, then read `components/HashpageApp.tsx` and the modules in `lib/` before changing anything. It is a Next.js app (App Router, React 19); this version of Next differs from older ones, so read `AGENTS.md` and the bundled docs in `node_modules/next/dist/docs/` before touching routes or metadata.

## What it is

Hashpage is a document format and a reference client for it. A document is semantic HTML (no styles, no scripts, no classes), compressed with deflate, base64url-encoded, and carried in the URL fragment after `#`. Whoever has the link has the document. The reader's client, not the author, decides what it looks like: the client ships several "themes," each a classless stylesheet that styles bare elements, and the reader's choice is stored on their device and never enters a link.

It descends from Paul Ford's Tiny Little Office (tinylittleoffice.com, MIT, Oct 2026), which stores documents in the URL as structured data. Hashpage's two departures are: the payload is HTML, and the payload is restricted to semantics so that themes can be opinionated without breaking documents. The analogy we keep coming back to: Markdown won because you cannot style it; semantic HTML is Markdown with a real vocabulary.

## Current state

Hosted on Vercel at https://hashpage.dev (project `zach-s-projects/hashpage`, deployed on every push to `main`).

**Layout.**

| Path | What it is |
| --- | --- |
| `components/HashpageApp.tsx` | The editor and reader, a client component. |
| `components/Logo.tsx`, `components/icons.tsx` | The logo mark (exports its path data for the OG cards) and 16px line icons. |
| `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png` | Favicons, picked up by Next's file conventions. The SVG switches to a light mark in dark mode; the ICO (16/32/48) and the 180px touch icon were rendered from the same artwork. |
| `lib/codec.ts` | `deflate`, `inflate(bytes, maxBytes)`, `b64u`, `unb64u`, `encode(html, reader)`, `decode(payload, maxBytes)`. Runs in browsers and Node. |
| `lib/sanitize.ts` | `DROP_TAGS`, `DROP_ATTRS`, `sanitizeDocument(doc)` (shared by client and server), `sanitize(src)` (browser, uses `DOMParser`). |
| `lib/summary.ts` | Server only. Decodes a `/p/` payload (capped at 256 KB inflated), parses it with linkedom, sanitizes, and extracts title, lede, first blocks and word count. Only text leaves it. |
| `lib/og.tsx` | Link-preview cards drawn with `next/og`: `siteCard()` and `documentCard(summary)`. Fonts in `assets/fonts` (Geist and IBM Plex Serif, OFL; Satori needs .woff, not .woff2). |
| `lib/themes.ts`, `lib/starter.ts` | The viewer themes and the starter document, moved verbatim from the old `index.html`. |
| `app/page.tsx` | `/`: the client. Documents arrive in the fragment. |
| `app/p/[payload]/page.tsx` | `/p/<prefix>.<payload>`: the same client, plus `generateMetadata` from the decoded document. `robots: noindex`. |
| `app/opengraph-image.tsx`, `app/p/[payload]/opengraph-image.tsx` | The generic card, and the per-document card. |

**Link format.** `#<prefix>.<base64url>`. Prefixes: `z.` deflated, opens in editor; `v.` deflated, opens in reader mode; `t.` uncompressed fallback. Parsed by the regex `/^#?([zvt])\.([A-Za-z0-9_-]+)$/`. The payload alphabet must stay exactly letters, digits, `-`, `_` with `.` as the one separator (it is URL-safe in both a fragment and a path segment, and the claude.ai artifact viewer only passes fragments through if they contain nothing but `[A-Za-z0-9._~-]`). Do not add `=`, `/`, `+`, or `?`-style parameters.

**Preview links.** `/p/<prefix>.<payload>` carries the same payload in the path, so link-preview crawlers (which never see fragments) can read it. They are opt-in via "Copy preview link," always use `v.`, and are refused client-side above 8,000 characters (`PREVIEW_MAX`): Vercel returned 502 for paths past ~8,000 characters when measured (8,036 worked, 8,500 did not). Generated cards are served with an immutable Cache-Control, since the URL fully determines the image. The trade-off is explicit in the button's tooltip: the server sees these documents; `#` links still never reach it. `next.config.ts` sets `htmlLimitedBots: /.*/` so metadata is always in `<head>`, not streamed, for any crawler.

**Encoding.** `TextEncoder` → `CompressionStream('deflate-raw')` → base64url without padding. Decoding is the reverse with `DecompressionStream`. If `CompressionStream` is absent, the client writes `t.` links and reads `z.`/`v.` links fail-safe ("could not read that link").

**Sanitizer.** Runs on every edit before encoding, so the link only ever carries sanitized markup, and again on the server before any preview text is extracted. Removes elements: `style script link iframe object embed template noscript svg canvas font center`. Removes attributes: anything starting with `on`, plus `style class width height bgcolor color align valign border cellpadding cellspacing face size`, plus `href`/`src` with a `javascript:` scheme. Keeps `id`, `href`, `datetime`, `data-*`, and everything else. If you change the drop lists, update the "Vocabulary" section of the starter document to match. linkedom only builds a `<body>` for whole documents, so the server wraps the fragment and reads the title with `querySelector('title')`.

**Themes** (`THEMES`). Keys: `reader`, `terminal`, `brutalist`, `newsprint`, `none`. Each is `{ name, css }`. The CSS must style bare elements only and must handle every element in the starter document's vocabulary table. The chosen key is saved in `localStorage` under `hashpage.theme` through a `useSyncExternalStore` store (with an in-memory fallback when storage is unavailable). Rendering: the preview iframe's `srcDoc` is doctype + metas + `<style>theme.css</style>` + html, with `sandbox="allow-popups"`; scripts are not allowed and must not be, since the sanitizer is the second line of defense, not the first.

**UI.** Follows Vercel's Geist design system (vercel.com/geist). Header: logo and wordmark, theme select, New, Open File, Open in Tab, Copy Preview Link, Copy Reader Link, Copy Edit Link (primary), GitHub icon; a read-only link field with a copy button; a size gauge (stats in mono, a status badge, a progress bar). On phones the copy buttons drop the word "Copy" visually (it stays in the accessible name) and Open in Tab becomes an icon. Main: editor and preview as two cards; under 760px a segmented switch picks one. Reader mode (`html.reader`, entered via a `v.` link or a `/p/v.` path) hides the editor and header and shows a floating bar with the logo (a full-page link to `/`), a theme select and "Edit This Page." An inline script in `app/layout.tsx` sets `html.reader` before first paint so readers never see the editor flash. Readers keep the address they arrived on; once someone edits, `history.replaceState` keeps the address bar at `/#z.…`. A `hashchange` listener reloads the document if the fragment changes externally.

**OG cards.** The site card is Geist dark with the logo. The document card uses Reader-theme colors and IBM Plex Serif, with the logo and Geist Mono in its footer; it shows the title, the first paragraph as a lede, then the next blocks (headings, paragraphs, list items, quotes) until the space runs out, fading into a footer with word count and reading time. `nav`, `footer`, `table`, `details`, `aside` and `figure` are skipped. Satori needs `display: flex` on every multi-child element, and blocks need `flexShrink: 0` or they overlap when the card overflows.

**Size verdicts.** ≤2,000 chars "fits anywhere, even SMS"; ≤8,000 "fine for chat apps and email"; ≤32,000 "browsers only; some apps truncate"; above that "may not survive sharing." These are pragmatic, not sourced from a spec. If you refine them, keep the four-band shape.

**Starter document** (`STARTER`). A wiki-style article about Hashpage itself, using every element in the vocabulary. It is the test fixture for themes: if a theme renders the starter well in all sections, it is done. Measured: 7,492 bytes of source, ~2,900 deflated, ~3,900-character link. The `<meter>` in its Limits section hard-codes that number; update it if the starter changes materially.

## Conventions

- TypeScript, React function components, no UI framework or CSS framework. Keep dependencies few: today they are `next`, `react`, `react-dom` and `linkedom`.
- The chrome uses Geist's tokens (`--ds-background-*`, `--ds-gray-*`, `--ds-gray-alpha-*`, accent scales, `--ds-focus-ring`, shadows), copied from vercel.com/geist into `:root` at the top of `app/globals.css` for light, `prefers-color-scheme: dark`, and `[data-theme="dark"]`. Steps 100–300 are component backgrounds, 400–600 borders, 700–800 solid fills, 900–1000 text. Do not introduce literal colors in component rules. Type follows Geist's scale (label 13/14, copy 13 mono, button 14/12, heading 16); controls are 32px high with a 6px radius, cards and menus 12px. Geist and Geist Mono load through `next/font/google`.
- The page must work at 400px width with no horizontal scroll, and must stay complete at rest (no content hidden until scroll or interaction).
- The host page's theme (the editor chrome) and the document themes (inside the iframe) are separate systems. Don't let one leak into the other.
- `cacheComponents` is on. Anything that reads `params` must sit behind `Suspense` or be marked intentional; see the `Connection` marker in `app/p/[payload]/page.tsx`.
- Before pushing, run `npm run lint` and `npm run build`. See "Verification."

## What to work on, in rough priority

1. **Tests.** The repo, README, MIT license and `package.json` exist; the pure functions are already modules in `lib/`. Tests to write: base64url round-trip including bytes ≥0x80 and lengths 0–3 mod 4; deflate round-trip on the starter and on a 100 KB document; `decode` respects `maxBytes` (a deflate bomb returns null on the server); sanitizer drops every item in both drop lists and keeps `id`, `href`, `datetime`, `data-*`; sanitizer neutralizes `javascript:` hrefs; `decode` rejects malformed prefixes; `summarize` extracts title, lede and blocks from the starter. Add one Playwright smoke test: load the page, confirm the starter renders, change the theme, confirm the fragment did not change; open a `/p/v.` link and confirm reader mode and the `og:image` tag.

2. **Theme-as-link.** A theme is a bare-element stylesheet, so it fits in a fragment too. Add an `s.` prefix for a deflated stylesheet. UX: a theme link opens the client with that theme applied and offers "Keep this theme," which stores the CSS under a user-chosen name in localStorage and adds it to both theme selects. Sanitize imported CSS: reject `@import`, `url(`, `expression(`, and anything targeting the host page (there is no host page inside the iframe, but be strict anyway). A theme link must never carry a document, and a document link must never carry a theme; keep the two prefixes disjoint.

3. **Vocabulary extensions via `data-*`.** HTML lacks a semantic hook for a few things authors will want: callout level (`<aside data-kind="warning">`), slide breaks, and a fact box. Define a small, documented set of `data-kind` values, have at least the Reader and Brutalist themes interpret them, and let other themes ignore them. Add the set to the starter's Vocabulary section. Do not add new elements or allow `class`.

4. **QR export.** Render the current link as a QR in a modal (pin an exact version of `qrcode-generator` from npm), and show the version/size so authors can see when a page outgrows what a phone camera reads comfortably (alphanumeric mode will not apply because of lowercase; expect byte mode, roughly 2,900 characters at version 40-L, practically far fewer).

5. **Agent on-ramp.** Add `public/llms.txt` describing the format in one page, and a tiny CLI, `npx hashpage encode page.html [--reader] [--preview] [--base https://hashpage.dev/]`, that prints a link, plus `npx hashpage decode <link>` that prints the HTML. Both use `lib/codec.ts` and `sanitizeDocument` with linkedom, the same path the server uses, so an agent cannot produce a link the client would strip differently. Then a `SKILL.md` for coding agents that says: write semantic HTML from the vocabulary table, run `encode`, hand the user the link.

6. **Editor quality of life.** Element insert menu (one click to insert a `<details>` or `<dl>` skeleton); lint warnings in the editor header for heading levels that skip, tables without `<thead>`, `<time>` without `datetime`; "Format" button that pretty-prints the sanitized HTML back into the textarea. Keep syntax highlighting out unless it can be done without a library.

7. **Optional short links.** Only if asked. The pattern is Tiny Little Office's: the browser encrypts the payload with a random key, posts ciphertext to a tiny worker, and the key goes after `#` in the short link so the server never sees content. If you build this, it must be an opt-in button, documents must keep working without it, and links must expire. Note that encrypted short links cannot have document previews; that is what `/p/` is for.

## Known issues

- Safari does not reliably support `summary::marker { content: … }`, so the Terminal theme's `[+]`/`[-]` markers may not show there. A `summary::before` fallback would fix it.
- The Newsprint drop cap selector targets the first `<p>` in the first `<section>` or directly inside `<article>`; documents that open with an `<aside>` will put the drop cap in an odd place. Consider restricting it to `article > p:first-of-type`.
- `history.replaceState` is called on every debounced edit. Some browsers rate-limit this (Safari: ~100 per 30 s). It has not caused a visible problem but a longer debounce or a "dirty → sync on idle" strategy would be safer.
- The OG fonts cover Latin and Latin Extended only; other scripts in a title render with missing glyphs. Adding Noto subsets to `lib/og.tsx` would fix it.
- `npm audit` reports a `braces` advisory through `eslint-config-next`. It is dev-only (`npm audit --omit=dev` is clean).

## Verification

```sh
npm run lint && npm run build
npx next start -p 3123   # then:
curl -s localhost:3123/ | grep og:image                               # generic card
curl -s -A Slackbot localhost:3123/p/v.<payload> | grep 'og:'         # per-document metadata in <head>
curl -s -o card.png localhost:3123/p/v.<payload>/opengraph-image      # look at it
```

Make a payload from the starter with the encoder in `lib/codec.ts`, or copy one from the running app's "Copy preview link."

## Things not to do

- Do not put the theme, or any viewer preference, into the link.
- Do not allow scripts in documents, in themes, or in the preview sandbox, whatever the justification.
- Do not make `#` links depend on the server. Everything the client needs to open a fragment link ships in the page; `/p/` previews are the only server-side reading of documents, and they stay opt-in.
- Do not log, store or index preview payloads in app code. The server reads them to draw a card and forgets them. (Vercel's own request logs still record paths; that is part of the trade-off the tooltip states.)
- Do not change what an existing prefix means. Add a new prefix and keep reading the old ones.
- Do not reintroduce `class` or `style` as an escape hatch. `data-*` is the escape hatch.
