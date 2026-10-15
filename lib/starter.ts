// The starter document doubles as the theme test fixture: it uses every element in the vocabulary.
export const STARTER = `<title>Hashpage</title>
<article>
  <header>
    <h1>Hashpage</h1>
    <p>A document format where the link is the document and the reader owns the look. <time datetime="2026-10-14">Last edited October 14, 2026</time>.</p>
    <nav>
      <ul>
        <li><a href="#how">How it works</a></li>
        <li><a href="#vocab">Vocabulary</a></li>
        <li><a href="#themes">Themes</a></li>
        <li><a href="#limits">Limits</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
    </nav>
  </header>

  <p><strong>Hashpage</strong> is a way of publishing a small page without a server. The page is written in plain <em>semantic HTML</em>, compressed, and placed after the <code>#</code> in a URL. Anyone who has the link has the page. No account, no upload, nothing stored anywhere except in the link itself.</p>

  <aside>This article is itself a Hashpage. The text you are reading, and its structure, are the only things in the link. The typeface, colors and layout came from the client you opened it in. Change the theme and this page changes with it.</aside>

  <section id="how">
    <h2>How it works</h2>
    <p>A Hashpage link has three parts: the address of a client, a <code>#</code>, and a payload. The payload is the document, encoded so it survives being pasted anywhere a URL can go.</p>
    <ol>
      <li>The author writes semantic HTML. Styles, scripts and classes are dropped before encoding.</li>
      <li>The HTML is compressed with <code>deflate</code>, the same algorithm inside gzip and PNG.</li>
      <li>The bytes are written as base64url, an alphabet of letters, digits, <code>-</code> and <code>_</code> that needs no escaping.</li>
      <li>A two-character prefix tells the client how to open it.</li>
    </ol>
    <pre>https://example.org/hashpage#z.yXZbBattAEIbv~xQLPRTMxtS...</pre>
    <dl>
      <dt><code>z.</code></dt><dd>Deflated. Opens in the editor.</dd>
      <dt><code>v.</code></dt><dd>Deflated. Opens in reader mode, full page.</dd>
      <dt><code>t.</code></dt><dd>Uncompressed. Fallback for clients without a deflate implementation.</dd>
    </dl>
    <p>Everything after <code>#</code> is a <dfn>fragment</dfn>. Browsers never send the fragment to the server, so the client's host sees only that a page was opened, never what was in it.</p>
  </section>

  <section id="vocab">
    <h2>Vocabulary</h2>
    <p>Because the link carries no presentation, the set of elements an author may use <em>is</em> the format. Clients promise to render all of them well. Authors promise to use them for what they mean.</p>
    <table>
      <thead><tr><th>Element</th><th>Use it for</th></tr></thead>
      <tbody>
        <tr><td><code>article</code>, <code>section</code></td><td>The document and its parts</td></tr>
        <tr><td><code>header</code>, <code>footer</code>, <code>nav</code></td><td>Title block, colophon, table of contents</td></tr>
        <tr><td><code>h1</code> to <code>h4</code></td><td>Headings, nested in order</td></tr>
        <tr><td><code>p</code>, <code>ul</code>, <code>ol</code>, <code>dl</code></td><td>Prose, lists, key and value pairs</td></tr>
        <tr><td><code>table</code> with <code>thead</code>, <code>tfoot</code></td><td>Anything that is really a grid</td></tr>
        <tr><td><code>aside</code></td><td>A note beside the main text</td></tr>
        <tr><td><code>details</code>, <code>summary</code></td><td>Something the reader can open</td></tr>
        <tr><td><code>figure</code>, <code>blockquote</code>, <code>cite</code></td><td>Quotations and captioned things</td></tr>
        <tr><td><code>time</code>, <code>address</code>, <code>meter</code></td><td>Dates, places, a value in a range</td></tr>
        <tr><td><code>mark</code>, <code>kbd</code>, <code>code</code>, <code>dfn</code></td><td>Highlights, keys, code, defined terms</td></tr>
      </tbody>
    </table>
    <p>Attributes that carry meaning stay: <code>href</code>, <code>datetime</code>, <code>id</code>, <code>data-*</code>. Attributes that carry looks go: <code>style</code>, <code>class</code>, <code>align</code>, <code>width</code>.</p>
  </section>

  <section id="themes">
    <h2>Themes</h2>
    <p>A theme is a short stylesheet that styles bare elements and knows nothing about any particular document. The reader picks one once; the choice is kept on their device and never enters a link. Two people opening the same link may see two different pages, and both are correct.</p>
    <dl>
      <dt>Reader</dt><dd>Book typography on paper. Follows the system light or dark setting.</dd>
      <dt>Terminal</dt><dd>Monospace on black. Headings become <code>#</code> lines, links get brackets, quotes get a <code>&gt;</code>.</dd>
      <dt>Brutalist</dt><dd>Black rules, hard shadows, one yellow.</dd>
      <dt>Newsprint</dt><dd>Double rules, a drop cap, justified columns of type.</dd>
      <dt>Browser default</dt><dd>No stylesheet at all. The proof that the document stands on its own.</dd>
    </dl>
    <figure>
      <blockquote><p>Markdown won because you could not style it. Semantic HTML is Markdown with a real vocabulary.</p></blockquote>
      <figcaption><cite>From the design notes</cite></figcaption>
    </figure>
  </section>

  <section id="limits">
    <h2>Limits</h2>
    <p>A link can only be so long before something along the way cuts it. Hashpage shows a running count and a verdict while you write.</p>
    <table>
      <thead><tr><th>Link length</th><th>Where it survives</th></tr></thead>
      <tbody>
        <tr><td>Up to 2,000 characters</td><td>Anywhere, including SMS and old browsers</td></tr>
        <tr><td>Up to 8,000</td><td>Chat apps, email, most forms</td></tr>
        <tr><td>Up to 32,000</td><td>Modern browsers; some apps truncate</td></tr>
        <tr><td>Beyond that</td><td>Not reliably</td></tr>
      </tbody>
    </table>
    <p>This article uses about <meter min="0" max="8000" value="3900">half</meter> of the chat-safe budget.</p>
    <ul>
      <li>No images, audio or video. They do not fit.</li>
      <li>No scripts. A link should not be able to run code on the reader's machine.</li>
      <li>No live collaboration. Sharing a link hands over a copy; edits make a new link.</li>
    </ul>
  </section>

  <section id="faq">
    <h2>Frequently asked questions</h2>
    <details>
      <summary>Is it private?</summary>
      <p>The content never reaches a server, but anything that logs URLs sees it: browser history, chat logs, link previews. Treat a Hashpage link the way you would treat the text itself.</p>
    </details>
    <details>
      <summary>Can a page link to another page?</summary>
      <p>Yes. A Hashpage link is an ordinary <code>href</code>. Pages can embed pages by reference, which is how a small wiki like this one could grow.</p>
    </details>
    <details>
      <summary>What happens if the client goes away?</summary>
      <p>The link still contains the document. Any client that speaks the format can open it, and the format is small enough to reimplement in an afternoon.</p>
    </details>
    <details>
      <summary>How do I edit this?</summary>
      <p>Press <kbd>Edit this page</kbd>. You get your own copy; the link you came from is unchanged.</p>
    </details>
  </section>

  <footer>
    <p><small>Hashpage follows the link-is-the-document idea from <a href="https://tinylittleoffice.com">Tiny Little Office</a>. This page is an example and may be edited by anyone who holds it.</small></p>
  </footer>
</article>
`;
