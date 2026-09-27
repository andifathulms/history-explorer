import type { MetadataRoute } from 'next'
import { loadCorpus, threadedRegions } from '@/lib/content'
import { absolute } from '@/lib/seo'

/**
 * Every page, listed once, for a crawler that will not find them all by
 * walking.
 *
 * Four hundred polity pages hang off an index that groups them by region
 * behind collapsible sections, and the region threads are reachable only from
 * the continuity page. A crawler gets there eventually; a sitemap means it
 * gets there on the first visit and knows the list is complete.
 *
 * `priority` is deliberately absent. It is advisory at best, ignored by
 * Google, and inventing a rank for a page is the same species of mistake as
 * inventing a figure for a polity. `lastModified` is absent for the same
 * reason: this exports statically, the build date is not the date the content
 * changed, and a date that means the build is a date that lies.
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const { narrative } = loadCorpus()

  const sections = [
    '/',
    '/polities/',
    '/rankings/',
    '/continuity/',
    '/timeline/',
    '/endings/',
    '/sources/',
    '/about/',
  ]

  const threads = threadedRegions().map((r) => `/continuity/${r.id}/`)
  // context_only records have no page, so listing them would hand a crawler a
  // set of 404s to hold against the site.
  const polities = narrative.filter((p) => !p.context_only).map((p) => `/polity/${p.id}/`)

  return [...sections, ...threads, ...polities].map((path) => ({ url: absolute(path) }))
}
