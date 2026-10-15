import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const sans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const mono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const description = 'Semantic HTML that lives in the link. The link carries meaning; your client carries the look.';

const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  // Absolute base for og:image. Preview deployments still resolve to their own URL.
  metadataBase: new URL(prod ? `https://${prod}` : 'http://localhost:3000'),
  title: 'Hashpage',
  description,
  openGraph: { title: 'Hashpage', description, siteName: 'Hashpage', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Hashpage', description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// Runs before first paint so a reader link never flashes the editor chrome.
const READER_BOOT = `try{if(/^#v\\./.test(location.hash)||/^\\/p\\/v\\./.test(location.pathname))document.documentElement.classList.add('reader')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: READER_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
