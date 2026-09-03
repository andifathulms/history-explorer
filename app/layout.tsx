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
export const metadata: Metadata = {
  title: {
    default: 'History Explorer — what empires were, and what can be said about them',
    template: '%s · History Explorer',
  },
  description:
    'A reading site about polities: what they were, how far they reached, how long they lasted, and — where a source says so — how one became the next.',
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
