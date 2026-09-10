import Link from 'next/link'
import type { Polity } from '@/lib/types'
import { formatRange } from '@/lib/years'

/**
 * Somewhere to go from the foot of a five-thousand-word page.
 *
 * The page used to end on the rating panel and stop. The breadcrumb was eight
 * thousand pixels above, the gutter nav is desktop-only, and a polity outside
 * a thread had no link to a sibling anywhere on the page — so finishing a
 * polity meant scrolling all the way back up to leave it.
 *
 * Neighbours are the polity before and after this one *in its own region, by
 * start date*. That is a browsing order, not a claim: it says these two records
 * sit either side of this one on the region's shelf, which is what /polities/
 * already shows, and it asserts nothing about succession. The labels say
 * "earlier" and "later" rather than "predecessor" and "successor" for exactly
 * that reason — the Succession section above is where descent is claimed, and
 * only where a source carries it.
 */
export function PolityFoot({
  previous,
  next,
  region,
}: {
  previous?: Polity
  next?: Polity
  region?: { id: string; name: string }
}) {
  return (
    <nav
      aria-label="More polities"
      className="mt-20 border-t border-kashi/25 pt-8"
    >
      <div className="grid gap-px border border-kashi/12 bg-kashi/12 sm:grid-cols-2">
        <Step polity={previous} direction="earlier" />
        <Step polity={next} direction="later" />
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-micro uppercase tracking-[0.08em] text-debu-ink">
        {region ? (
          <Link
            href={`/polities/#${region.id}`}
            className="transition-colors hover:text-firuze-ink"
          >
            All of {region.name}
          </Link>
        ) : null}
        <Link href="/polities/" className="transition-colors hover:text-firuze-ink">
          Every polity
        </Link>
        <Link href="/rankings/" className="transition-colors hover:text-firuze-ink">
          Rankings
        </Link>
        <a href="#main" className="ms-auto transition-colors hover:text-firuze-ink">
          Back to top
        </a>
      </p>
    </nav>
  )
}

/**
 * One end of the shelf. An empty end renders as a quiet, unlinked cell rather
 * than collapsing, so the pair keeps its shape at both ends of every region —
 * the first polity in a region is not missing anything.
 */
function Step({ polity, direction }: { polity?: Polity; direction: 'earlier' | 'later' }) {
  const label = direction === 'earlier' ? 'Earlier in the region' : 'Later in the region'

  if (!polity) {
    return (
      <div className="bg-kaghaz-raise px-6 py-5">
        <p className="kicker text-debu-ink">{label}</p>
        <p className="mt-2 text-[15px] italic text-debu-ink">
          {direction === 'earlier'
            ? 'Nothing on this shelf begins earlier.'
            : 'Nothing on this shelf begins later.'}
        </p>
      </div>
    )
  }

  return (
    <Link
      href={`/polity/${polity.id}/`}
      className={`group bg-kaghaz-raise px-6 py-5 transition-colors hover:bg-kaghaz-lift ${
        direction === 'later' ? 'sm:text-end' : ''
      }`}
    >
      <p className="kicker text-debu-ink">{label}</p>
      <p className="mt-2 font-display text-[19px] font-semibold leading-snug text-kashi-deep group-hover:text-firuze-ink">
        {polity.name.latin}
      </p>
      <p className="mt-1 font-mono text-[13px] tabular-nums text-debu-ink">
        {formatRange(polity.span.start.min, polity.span.start.max)}
      </p>
    </Link>
  )
}
