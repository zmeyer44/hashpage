// The contract: only semantics travel. Presentation and behavior are stripped before encoding.
// If you change the drop lists, update the "Vocabulary" section of the starter document to match.

export const DROP_TAGS = ['style', 'script', 'link', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'canvas', 'font', 'center'];
export const DROP_ATTRS = ['style', 'class', 'width', 'height', 'bgcolor', 'color', 'align', 'valign', 'border', 'cellpadding', 'cellspacing', 'face', 'size'];

/** Strips presentational and executable markup in place. Works on a browser Document or a linkedom one. */
export function sanitizeDocument(doc: Document): number {
  let stripped = 0;
  doc.querySelectorAll(DROP_TAGS.join(',')).forEach((el) => { el.remove(); stripped++; });
  doc.querySelectorAll('*').forEach((el) => {
    for (const a of Array.from(el.attributes)) {
      const n = a.name.toLowerCase();
      if (n.startsWith('on') || DROP_ATTRS.includes(n) || ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(a.value))) {
        el.removeAttribute(a.name);
        stripped++;
      }
    }
  });
  return stripped;
}

/** Browser-side: parse, strip, and serialize back to the `<title>` + body markup that goes into links. */
export function sanitize(src: string): { html: string; stripped: number } {
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const stripped = sanitizeDocument(doc);
  const title = doc.title ? '<title>' + doc.title.replace(/</g, '&lt;') + '</title>\n' : '';
  return { html: title + doc.body.innerHTML.trim() + '\n', stripped };
}
