# Hashpage

**The link carries meaning. Your client carries the look.**

Hashpage is a document format and a reference client for it. A document is semantic HTML (no styles, no scripts, no classes), compressed with deflate, base64url-encoded, and carried in the URL fragment after `#`. Whoever has the link has the document. Nothing is uploaded; the fragment never reaches a server.

The reader decides what a page looks like. The client ships several themes (Reader, Terminal, Brutalist, Newsprint, None), each a classless stylesheet for bare elements. A reader's theme choice stays on their device and is never part of a link.

**Try it:** <https://hashpage.dev/>

## Using it

Write semantic HTML in the editor on the left, then copy a link:

- **Copy edit link** opens the page in the editor.
- **Copy reader link** opens the page in reader mode. Readers can still choose "Edit this page."
- **Copy preview link** opens in reader mode too, and also gets a rich link preview in Slack, iMessage, X and other apps: a card with the page's title, opening lines and first section. To do that the document goes in the path instead of the fragment, so the server reads it to draw the card. Use it when a preview is worth that; `#` links stay private.

The size gauge shows how far the link will travel. Up to 2,000 characters fits anywhere, even SMS. Up to 8,000 is fine for chat and email. Up to 32,000 works in browsers, but some apps truncate links that long. Beyond that, the link may not survive sharing.

## Link format

```
https://hashpage.dev/#<prefix>.<base64url payload>
```

| Prefix | Payload                      | Opens in |
| ------ | ---------------------------- | -------- |
| `z.`   | deflate-raw, base64url       | editor   |
| `v.`   | deflate-raw, base64url       | reader   |
| `t.`   | uncompressed UTF-8, base64url | editor (fallback when `CompressionStream` is unavailable) |

The fragment alphabet is limited to letters, digits, `-` and `_`, with `.` as the only separator.

Preview links carry the same payload in the path, where crawlers can see it:

```
https://hashpage.dev/p/v.<base64url payload>
```

The server decodes it, sanitizes it with the same rules as the editor, and uses the text for `og:` tags and a generated image. Preview pages are marked `noindex`, and links over 8,000 characters are refused.

Every edit is sanitized before encoding. Presentational and executable markup is dropped: `style`, `script`, `iframe`, `svg`, `class`, `style=""`, `on*` handlers, `javascript:` URLs, and similar. Previews render in a sandboxed iframe with scripts disabled.

## Development

Hashpage is a [Next.js](https://nextjs.org) app.

```sh
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

| Path | What it is |
| --- | --- |
| `components/HashpageApp.tsx` | The editor and reader |
| `lib/codec.ts` | Link encoding and decoding, shared by browser and server |
| `lib/sanitize.ts` | The semantic-only sanitizer, shared by browser and server |
| `lib/summary.ts`, `lib/og.tsx` | Server-side preview text and OG image cards |
| `lib/themes.ts`, `lib/starter.ts` | Viewer themes and the starter document |
| `app/p/[payload]/` | Preview-link route, metadata and OG image |

It deploys to Vercel from `main`. Links point to wherever the app is served from, so a self-hosted copy makes its own links. [`HANDOFF.md`](HANDOFF.md) has the design notes and roadmap.

## Credits

Hashpage follows the link-is-the-document idea from Paul Ford's [Tiny Little Office](https://tinylittleoffice.com) (MIT), which stores documents in the URL as structured data. Hashpage changes two things: the payload is HTML, and it is limited to semantic markup so themes can take strong positions without breaking documents.

## License

[MIT](LICENSE). The IBM Plex fonts in `assets/fonts` are under the [SIL Open Font License](assets/fonts/OFL.txt).
