// Viewer themes. Each styles bare elements only; none knows anything about the document it is rendering.
export const THEMES: Record<string, { name: string; css: string }> = {
  reader: { name: 'Reader', css: `
:root { color-scheme: light dark; }
body { margin: 0 auto; padding: 2.5rem 1.25rem 4rem; max-width: 38rem; font: 18px/1.6 Charter, "Iowan Old Style", Georgia, serif; color: #1f1d1a; background: #fbf8f2; }
@media (prefers-color-scheme: dark) { body { color: #e6e0d4; background: #16140f; } a { color: #d9b36a; } th, td, hr, blockquote { border-color: #3a3528 !important; } aside, pre, details { background: #1f1c15 !important; } }
h1, h2, h3, h4 { line-height: 1.15; font-weight: 600; letter-spacing: -0.01em; margin: 1.6em 0 .5em; }
h1 { font-size: 2.2rem; margin-top: 0; } h2 { font-size: 1.5rem; } h3 { font-size: 1.2rem; }
header > p, footer { color: #6b655a; font-size: .95rem; }
footer { margin-top: 3rem; border-top: 1px solid #d8d2c3; padding-top: 1rem; }
a { color: #8a4b08; text-decoration-thickness: 1px; text-underline-offset: 2px; }
p, ul, ol, dl, table, figure, blockquote, pre, details { margin: 0 0 1.1em; }
blockquote { margin-left: 0; padding-left: 1rem; border-left: 3px solid #d8d2c3; font-style: italic; }
figcaption, cite { font-size: .9rem; color: #6b655a; font-style: normal; }
table { border-collapse: collapse; width: 100%; font-size: .95rem; }
th, td { text-align: left; padding: .45em .5em .45em 0; border-bottom: 1px solid #d8d2c3; vertical-align: top; }
th { font-weight: 600; } td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
tfoot td { border-bottom: 0; font-weight: 600; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: .3em 1.2em; } dt { font-weight: 600; } dd { margin: 0; }
aside, pre, details { background: #f1ecdf; border-radius: 4px; padding: .9rem 1rem; }
aside { font-size: .95rem; } summary { cursor: pointer; font-weight: 600; }
code, kbd, samp { font: .88em/1.4 "SF Mono", Menlo, Consolas, monospace; } kbd { border: 1px solid #c9c2b2; border-bottom-width: 2px; border-radius: 3px; padding: 0 .35em; }
mark { background: #ffe58a; padding: 0 .15em; } hr { border: 0; border-top: 1px solid #d8d2c3; margin: 2rem 0; }
small { font-size: .85rem; } time { white-space: nowrap; } address { font-style: normal; }
meter, progress { width: 100%; } img { max-width: 100%; height: auto; } nav ul { list-style: none; padding: 0; display: flex; gap: 1rem; flex-wrap: wrap; }
button, input, select, textarea { font: inherit; }
` },
  terminal: { name: 'Terminal', css: `
:root { color-scheme: dark; }
body { margin: 0; padding: 1.5rem; max-width: 80ch; font: 15px/1.5 "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace; color: #b8f5b8; background: #070b07; }
body::after { content: "_"; animation: blink 1s steps(2) infinite; } @keyframes blink { to { opacity: 0; } }
h1, h2, h3, h4 { font-size: 1em; font-weight: 700; color: #ffe08a; margin: 1.5em 0 .5em; text-transform: uppercase; letter-spacing: .08em; }
h1::before { content: "# "; } h2::before { content: "## "; } h3::before { content: "### "; } h1 { margin-top: 0; }
header > p, footer, figcaption, cite, small { color: #6fa06f; }
footer::before, hr { content: ""; display: block; border: 0; border-top: 1px dashed #2f4a2f; margin: 1.5em 0; }
a { color: #7ad7ff; text-decoration: none; } a::before { content: "["; } a::after { content: "]"; } a:hover { background: #7ad7ff; color: #070b07; }
p, ul, ol, dl, table, figure, blockquote, pre, details, aside { margin: 0 0 1em; }
ul { list-style: none; padding-left: 2ch; } ul li::before { content: "- "; margin-left: -2ch; } ol { padding-left: 3ch; }
blockquote { margin-left: 0; padding-left: 2ch; color: #9cd49c; border-left: 1px solid #2f4a2f; } blockquote p::before { content: "> "; }
table { border-collapse: collapse; } th, td { text-align: left; padding: .2em 1ch; border: 1px solid #2f4a2f; vertical-align: top; } th { color: #ffe08a; }
td:last-child, th:last-child { text-align: right; } tfoot td { font-weight: 700; color: #ffe08a; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: .2em 2ch; } dt { color: #ffe08a; } dt::after { content: ":"; } dd { margin: 0; }
aside { border: 1px solid #2f4a2f; padding: .75em 1ch; } aside::before { content: "NOTE "; color: #ffe08a; }
details { border: 1px solid #2f4a2f; padding: .5em 1ch; } summary { cursor: pointer; color: #ffe08a; } summary::marker { content: "[+] "; } details[open] summary::marker { content: "[-] "; }
pre { background: #0e150e; padding: .75em 1ch; overflow-x: auto; } code, kbd, samp { font: inherit; } kbd { color: #ffe08a; } kbd::before, kbd::after { content: "'"; }
mark { background: #b8f5b8; color: #070b07; } strong { color: #fff; } em { color: #ffe08a; font-style: normal; }
time { color: #7ad7ff; } address { font-style: normal; } img { max-width: 100%; filter: grayscale(1) contrast(1.2); }
meter, progress { width: 100%; accent-color: #b8f5b8; } nav ul { display: flex; gap: 2ch; padding: 0; } nav li::before { content: ""; }
button, input, select, textarea { font: inherit; background: #0e150e; color: inherit; border: 1px solid #2f4a2f; }
` },
  brutalist: { name: 'Brutalist', css: `
:root { color-scheme: light; }
body { margin: 0; padding: 1.5rem 1rem 4rem; max-width: 44rem; font: 17px/1.45 Helvetica, Arial, sans-serif; color: #000; background: #fff; }
h1, h2, h3, h4 { font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; line-height: .95; margin: 1.2em 0 .4em; }
h1 { font-size: clamp(2.6rem, 9vw, 4.5rem); margin-top: 0; border-bottom: 6px solid #000; padding-bottom: .15em; }
h2 { font-size: 1.8rem; background: #000; color: #fff; display: inline-block; padding: .1em .3em; }
h3 { font-size: 1.2rem; text-decoration: underline; text-decoration-thickness: 4px; }
header > p, footer { font-weight: 700; } footer { margin-top: 3rem; border-top: 6px solid #000; padding-top: .75rem; }
a { color: #000; font-weight: 700; text-decoration: underline; text-decoration-thickness: 3px; } a:hover { background: #ff0; }
p, ul, ol, dl, table, figure, blockquote, pre, details, aside { margin: 0 0 1.2em; }
ul, ol { padding-left: 1.4em; } li::marker { font-weight: 900; }
blockquote { margin-left: 0; border: 4px solid #000; padding: 1rem; box-shadow: 8px 8px 0 #000; font-weight: 700; font-size: 1.15em; }
figure { margin-left: 0; margin-right: 0; } figcaption, cite { font-size: .85rem; text-transform: uppercase; letter-spacing: .06em; font-style: normal; font-weight: 700; }
table { border-collapse: collapse; width: 100%; border: 4px solid #000; box-shadow: 8px 8px 0 #000; margin-bottom: 1.8em; }
th, td { text-align: left; padding: .5em .6em; border: 2px solid #000; vertical-align: top; }
th { background: #000; color: #fff; text-transform: uppercase; letter-spacing: .05em; } td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; }
tfoot td { background: #ff0; font-weight: 900; }
dl { border: 4px solid #000; padding: .75rem 1rem; display: grid; grid-template-columns: max-content 1fr; gap: .25em 1.5em; } dt { font-weight: 900; text-transform: uppercase; } dd { margin: 0; }
aside { border: 4px dashed #000; padding: .75rem 1rem; background: #ff0; font-weight: 700; }
details { border: 4px solid #000; padding: .6rem 1rem; } summary { cursor: pointer; font-weight: 900; text-transform: uppercase; }
pre { background: #000; color: #fff; padding: 1rem; overflow-x: auto; } code, kbd, samp { font: .9em Menlo, Consolas, monospace; } kbd { border: 2px solid #000; box-shadow: 2px 2px 0 #000; padding: 0 .3em; font-weight: 700; }
mark { background: #ff0; font-weight: 700; } hr { border: 0; border-top: 6px solid #000; margin: 2rem 0; }
small { font-size: .8rem; } address { font-style: normal; font-weight: 700; } img { max-width: 100%; border: 4px solid #000; }
meter, progress { width: 100%; accent-color: #000; } nav ul { list-style: none; padding: 0; display: flex; gap: .5rem; flex-wrap: wrap; } nav a { border: 3px solid #000; padding: .2em .5em; text-decoration: none; }
button, input, select, textarea { font: inherit; border: 3px solid #000; background: #fff; } button { background: #000; color: #fff; font-weight: 900; text-transform: uppercase; }
` },
  newsprint: { name: 'Newsprint', css: `
:root { color-scheme: light; }
body { margin: 0 auto; padding: 2rem 1.25rem 4rem; max-width: 40rem; font: 16px/1.5 "Times New Roman", Times, serif; color: #1a1a1a; background: #f4f1e8; hyphens: auto; }
h1 { font: 700 2.8rem/1 "Times New Roman", Times, serif; letter-spacing: -0.02em; margin: 0 0 .3em; border-bottom: 3px double #1a1a1a; padding-bottom: .25em; text-wrap: balance; }
h2 { font-size: 1.35rem; font-weight: 700; margin: 1.8em 0 .4em; border-top: 1px solid #1a1a1a; padding-top: .4em; }
h3 { font-size: 1.05rem; font-weight: 700; font-style: italic; margin: 1.4em 0 .3em; }
header > p { font-size: .8rem; text-transform: uppercase; letter-spacing: .12em; margin: 0 0 1.6em; }
article > p:first-of-type::first-letter, section:first-of-type > p:first-of-type::first-letter { float: left; font-size: 3.4em; line-height: .8; padding: .08em .1em 0 0; font-weight: 700; }
footer { margin-top: 3rem; border-top: 1px solid #1a1a1a; padding-top: .6rem; font-size: .85rem; }
a { color: #1a1a1a; } p { text-align: justify; margin: 0 0 1em; }
ul, ol, dl, table, figure, blockquote, pre, details, aside { margin: 0 0 1.2em; }
blockquote { margin: 1.2em 1.5em; font-size: 1.15em; font-style: italic; text-align: center; border-top: 1px solid #1a1a1a; border-bottom: 1px solid #1a1a1a; padding: .6em 0; }
figcaption, cite { font-size: .8rem; font-style: normal; text-transform: uppercase; letter-spacing: .08em; }
table { border-collapse: collapse; width: 100%; font-size: .9rem; border-top: 2px solid #1a1a1a; border-bottom: 2px solid #1a1a1a; }
th, td { text-align: left; padding: .35em .4em; border-bottom: 1px solid #b9b3a4; vertical-align: top; } th { font-size: .75rem; text-transform: uppercase; letter-spacing: .08em; }
td:last-child, th:last-child { text-align: right; font-variant-numeric: tabular-nums; } tfoot td { border-bottom: 0; font-weight: 700; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: .2em 1.2em; font-size: .95rem; } dt { font-weight: 700; } dd { margin: 0; }
aside { border: 1px solid #1a1a1a; padding: .7rem .9rem; font-size: .92rem; background: #ece7d9; }
details { border-top: 1px solid #1a1a1a; border-bottom: 1px solid #1a1a1a; padding: .5rem 0; } summary { cursor: pointer; font-weight: 700; }
pre { background: #ece7d9; padding: .75rem; overflow-x: auto; font-size: .85rem; } code, kbd, samp { font: .88em "Courier New", Courier, monospace; } kbd { border: 1px solid #1a1a1a; padding: 0 .25em; }
mark { background: #e4d58a; } hr { border: 0; border-top: 1px solid #1a1a1a; margin: 1.5rem 0; } hr::after { content: "\\2042"; display: block; text-align: center; margin-top: -.75em; background: #f4f1e8; width: 3ch; margin-left: auto; margin-right: auto; }
small { font-size: .8rem; } address { font-style: normal; } img { max-width: 100%; filter: grayscale(1); }
meter, progress { width: 100%; } nav ul { list-style: none; padding: 0; display: flex; gap: 1.2rem; flex-wrap: wrap; font-size: .8rem; text-transform: uppercase; letter-spacing: .1em; }
button, input, select, textarea { font: inherit; border: 1px solid #1a1a1a; background: #fff; }
` },
  none: { name: 'Browser default', css: '' }
};

export const THEME_KEY = 'hashpage.theme';
