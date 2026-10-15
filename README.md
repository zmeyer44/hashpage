# Hashpage

**The link carries meaning. Your client carries the look.**

Hashpage is a document format and a reference client for it. A document is semantic HTML (no styles, no scripts, no classes), compressed with deflate, base64url-encoded, and carried in the URL fragment after `#`. Whoever has the link has the document. Nothing is uploaded; the fragment never reaches a server.

The reader decides what a page looks like. The client ships several themes (Reader, Terminal, Brutalist, Newsprint, None), each a classless stylesheet for bare elements. A reader's theme choice stays on their device and is never part of a link.

**Try it:** <https://hashpage.dev/>

## Using it

Write semantic HTML in the editor on the left, then copy a link:

- **Copy edit link** opens the page in the editor.
- **Copy reader link** opens the page in reader mode. Readers can still choose "Edit this page."

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

Every edit is sanitized before encoding. Presentational and executable markup is dropped: `style`, `script`, `iframe`, `svg`, `class`, `style=""`, `on*` handlers, `javascript:` URLs, and similar. Previews render in a sandboxed iframe with scripts disabled.

## Self-hosting

The whole client is `index.html`. It has no build step and no dependencies apart from two Google Fonts. It runs from `file://`, from any static host, or from this repo's GitHub Pages site. Links point to wherever the client is served from.

## Credits

Hashpage follows the link-is-the-document idea from Paul Ford's [Tiny Little Office](https://tinylittleoffice.com) (MIT), which stores documents in the URL as structured data. Hashpage changes two things: the payload is HTML, and it is limited to semantic markup so themes can take strong positions without breaking documents.

## License

[MIT](LICENSE)
