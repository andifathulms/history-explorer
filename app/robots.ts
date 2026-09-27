import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/seo'

/**
 * Everything is public and nothing is off limits, said out loud, with the
 * sitemap named so a crawler does not have to guess at its location.
 *
 * A crawler reads robots.txt at the origin root only, and this deploys under
 * a subpath, so the file is advisory here rather than binding. It costs one
 * request and it is the right file to already have on the day the site moves
 * to a domain of its own.
 */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absolute('/sitemap.xml'),
  }
}
