import type { Metadata } from 'next'
import './globals.css'
import { SiteFooter } from '@/components/SiteFooter'

/**
 * Three Latin faces, each with one job, and none of them decorative.
 *
 * Spectral is the reading face: it holds up at chapter length and has the
 * dryness a reference work wants. Fraunces is headings only — the site needed a
 * voice at display size, and doing it by scaling the body face up produced
 * headings that looked like large paragraphs. IBM Plex Mono carries the
 * figures, which on this site are the subject matter rather than furniture: a
 * year, a percentile and a km² figure all line up in a column because they are
 * meant to be compared. Amiri sets the Perso-Arabic script names, which are
 * content — one of the fields the corpus records — rather than ornament.
 *
 * The @font-face rules live in globals.css and the files live in app/fonts,
 * so nothing here reaches the network at build time. See the note at the top
 * of globals.css for why.
 */
/**
 * Asset paths are prefixed by hand.
 *
 * `basePath` in next.config.mjs rewrites the URLs Next itself emits — pages,
 * chunks, `next/link` — and this site is served from /history-explorer on
 * Pages, which is why every internal anchor goes through `next/link` rather
 * than a bare href. Metadata icon and image URLs are not part of that
 * rewriting: what is written here is what lands in the <head>. A bare
 * "/brand/icon.svg" would resolve against the domain root and 404 on the
 * deployed site while working perfectly in development, which is the most
 * expensive kind of wrong.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Where relative metadata URLs resolve from, for the cards that need absolute ones. */
const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://andifathulms.github.io/history-explorer'

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: 'History Explorer — what empires were, and what can be said about them',
    template: '%s · History Explorer',
  },
  description:
    'A reading site about polities: what they were, how far they reached, how long they lasted, and — where a source says so — how one became the next.',
  applicationName: 'History Explorer',
  // Next emits the manifest link without the base path, so it is named here
  // instead. The file itself lands at out/manifest.webmanifest and is served
  // under the subpath correctly; only the href needed saying.
  manifest: `${base}/manifest.webmanifest`,
  icons: {
    // The SVG first: it is the 32px tier of the mark drawn as vectors, and a
    // browser that understands it never fetches a raster. The PNG is the
    // fallback and the .ico slot is deliberately empty — nothing in the
    // support matrix for a site like this still needs one.
    icon: [
      { url: `${base}/brand/icon.svg`, type: 'image/svg+xml' },
      { url: `${base}/brand/icon-32.png`, sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: `${base}/brand/apple-touch-icon.png`, sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'History Explorer',
    url: `${site}/`,
    title: 'History Explorer — what empires were, and what can be said about them',
    description:
      'Every claim carries the work it came from, and where no figure exists the gap is drawn rather than filled.',
    images: [
      {
        // Relative, not prefixed. Card images resolve against `metadataBase`,
        // which already carries the subpath — prefixing here too produced
        // /history-explorer/history-explorer/brand/og.png. The icon links
        // above are the opposite case and do need it: nothing resolves those
        // for us.
        url: '/brand/og.png',
        width: 1200,
        height: 630,
        // The card is the span strip with one bar drawn hollow, which is the
        // site's own rule in one picture: a gap is shown, not filled.
        alt: 'History Explorer — duration spans on one axis, one of them hollow for want of a cited date.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'History Explorer',
    description:
      'Every claim carries the work it came from, and where no figure exists the gap is drawn rather than filled.',
    images: ['/brand/og.png'],
  },
}

export const viewport = {
  themeColor: '#0B1520',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-dawat">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
