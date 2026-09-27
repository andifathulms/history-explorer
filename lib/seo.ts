import type { Metadata } from 'next'

/**
 * One place that knows what a shared link looks like.
 *
 * A link pasted into a chat window is read by a scraper, not a browser: it
 * takes the first few kilobytes of the document, looks for og: tags, and draws
 * a card from whatever it finds. Everything it needs has to be absolute and
 * present in the static HTML, because there is no second request and no
 * JavaScript.
 *
 * Two traps this module exists to close. The first is inheritance: a page that
 * sets only `title` and `description` still inherits the root `openGraph`
 * block wholesale, so every polity was sharing as the site's front page under
 * the site's own title. The second is the subpath. This deploys to GitHub
 * Pages under /history-explorer, and a canonical or card URL built from a
 * bare "/polity/samanid/" resolves against the domain root — correct in
 * development, wrong everywhere that matters. Both are fixed by building the
 * absolute URL here, once, from the same base the rest of the build uses.
 */

/** The subpath the site is served from, empty in development. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** Origin plus subpath, with no trailing slash. Every absolute URL starts here. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://andifathulms.github.io/history-explorer'
).replace(/\/+$/, '')

export const SITE_NAME = 'History Explorer'

/** The one sentence that goes under the name on a card with nothing better to say. */
export const TAGLINE = 'what empires were, and what can be said about them'

/** What the front page is, for a search result. */
export const SITE_DESCRIPTION =
  'A reading site about polities: what they were, how far they reached, how long they lasted, and — where a source says so — how one became the next.'

/** The same thing said shorter, for a card, where the second line is often clipped. */
export const SITE_CARD_DESCRIPTION =
  'Every claim carries the work it came from, and where no figure exists the gap is drawn rather than filled.'

/** The default card image, and the reason it is that picture rather than a logo. */
export const DEFAULT_OG_IMAGE = {
  path: '/brand/og.png',
  width: 1200,
  height: 630,
  alt: 'History Explorer — duration spans on one axis, one of them hollow for want of a cited date.',
}

/**
 * A site path — always with a leading and trailing slash, as the export writes
 * them — made absolute. `/` becomes the site root.
 */
export function absolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`.replace(/(?<!:)\/{2,}/g, '/')
}

/** The browser-tab title, which is also what the card headline says. */
export function fullTitle(title?: string): string {
  return title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${TAGLINE}`
}

/**
 * A description cut to what a card will actually show.
 *
 * A region blurb runs to four sentences, and every consumer of it truncates:
 * Google at roughly 160 characters, WhatsApp sooner, each of them mid-word and
 * without saying so. Cutting here means the break lands between words and at a
 * sentence where one is close to the limit, so the clipped version still reads
 * as a finished thought.
 */
export function clamp(text: string, limit = 200): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= limit) return t
  const head = t.slice(0, limit)
  const sentence = Math.max(head.lastIndexOf('. '), head.lastIndexOf('; '))
  if (sentence > limit * 0.6) return head.slice(0, sentence + 1)
  return `${head.slice(0, head.lastIndexOf(' '))}…`
}

export interface PageMeta {
  /** The page's own title, without the site name; omitted on the home page. */
  title?: string
  description: string
  /** Site path with both slashes, e.g. "/polity/samanid/". */
  path: string
  /** `article` for a page about one subject, `website` for an index. */
  type?: 'website' | 'article'
  image?: { path: string; width?: number; height?: number; alt: string }
}

/**
 * Title, description, canonical and both card blocks for one page.
 *
 * Every page calls this. A page that sets metadata by hand inherits the root
 * card and shares as the front page, which is the bug this replaced.
 */
export function pageMeta({ title, description, path, type = 'website', image }: PageMeta): Metadata {
  const url = absolute(path)
  const card = image ?? DEFAULT_OG_IMAGE
  const heading = fullTitle(title)
  const summary = clamp(description)

  return {
    ...(title ? { title } : {}),
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE_NAME,
      url,
      title: heading,
      description: summary,
      images: [
        {
          url: absolute(card.path),
          ...(card.width ? { width: card.width } : {}),
          ...(card.height ? { height: card.height } : {}),
          alt: card.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: heading,
      description: summary,
      images: [absolute(card.path)],
    },
  }
}
