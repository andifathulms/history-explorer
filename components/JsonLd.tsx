import { absolute, SITE_NAME, SITE_DESCRIPTION, clamp } from '@/lib/seo'

/**
 * Structured data, for the reader that is a machine.
 *
 * A crawler reads the prose and guesses at what the page is about. This says
 * it outright, in the vocabulary crawlers already parse: the site, and the
 * trail of pages a reader walked to get here, which is what puts a breadcrumb
 * row under a search result instead of a bare URL.
 *
 * It states nothing the page does not already show. A polity's block carries
 * its name, its dates, its one-line identity and the works its page cites,
 * each of them a field that is on the page and sourced; no confidence, no
 * ranking, no figure that is not cited, because a claim made to a machine is
 * still a claim.
 */
function Block({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Static, build-time JSON from our own data. The escape closes the one
      // way a string in the corpus could break out of the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/** The site itself, once, on the home page. */
export function SiteJsonLd() {
  return (
    <Block
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: absolute('/'),
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
      }}
    />
  )
}

export interface Crumb {
  name: string
  path: string
}

/** The trail to this page, in the order a reader would have walked it. */
export function BreadcrumbJsonLd({ trail }: { trail: Crumb[] }) {
  return (
    <Block
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: absolute(c.path),
        })),
      }}
    />
  )
}

export interface PolityJsonLdProps {
  name: string
  /** As the page prints it, e.g. "819–1005". */
  span: string
  identity: string
  path: string
  /** Full titles of the works the page cites, for `citation`. */
  citations: string[]
}

/** One polity, as the thing the page is about. */
export function PolityJsonLd({ name, span, identity, path, citations }: PolityJsonLdProps) {
  return (
    <Block
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${name}, ${span}`,
        description: clamp(identity),
        url: absolute(path),
        inLanguage: 'en',
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: absolute('/') },
        about: { '@type': 'Thing', name, description: clamp(identity) },
        ...(citations.length ? { citation: citations } : {}),
      }}
    />
  )
}
