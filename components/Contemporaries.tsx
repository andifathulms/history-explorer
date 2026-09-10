import Link from 'next/link'
import type { Contemporary } from '@/lib/contemporaries'
import { formatSpan } from '@/lib/years'
import { SectionHead } from '@/components/Shell'

/**
 * What else existed while this did.
 *
 * Costs no sourcing — every date here is already on the polity's own record —
 * and it is the best available answer to "was this big?" for the twenty-three
 * polities with no reach figure at all. Srivijaya cannot be ranked on extent
 * and can be placed among the Tang, the Abbasids and the Tibetan empire, which
 * tells a reader more than an empty axis does.
 *
 * Reference-set entries appear here unlinked. They have numbers and no page,
 * and including them is the point: a list of contemporaries drawn only from the
 * polities that happen to have chapters would describe this site's reading
 * rather than the period.
 *
 * Long lists are folded. The Abbasids overlap a hundred and seven records, and
 * a hundred and seven names is not a list a reader reads — on a phone, in one
 * column, it ran to roughly eight screens of names wedged between the turning
 * points and the map. So the first dozen show and the rest go behind a
 * disclosure.
 *
 * Which dozen is a real decision, and it is made on the only number here that
 * is not arbitrary: `certainYears`, the length of the overlap on the
 * conservative reading of both spans. The longest overlaps are the polities
 * this one actually shared a world with, as against the ones it brushed for a
 * decade at either end. They are then put back into date order to be read,
 * because the fold is about how many are shown and not about the order they
 * are shown in. The heading says both numbers, so the count is never hidden.
 *
 * A `<details>` rather than a client component: it costs no JavaScript across
 * two hundred and twelve pages, it works before hydration, and browsers open
 * it for find-in-page, which a hidden div does not.
 */

/** How many show before the fold, and the point at which folding is worth it. */
const SHOWN = 12
const FOLD_ABOVE = 16

function Row({ c }: { c: Contemporary }) {
  const label = (
    <>
      {c.name}
      <span className="ms-2 font-mono text-[13px] tabular-nums text-debu-ink">
        {formatSpan(c.span.from, c.span.to)}
      </span>
    </>
  )
  return (
    <li className="py-1">
      {c.hasPage ? (
        <Link
          href={`/polity/${c.id}/`}
          className="link-underline text-kashi hover:text-firuze-ink"
        >
          {label}
        </Link>
      ) : (
        <span className="text-debu-ink" title="Listed for scale; not written up">
          {label}
        </span>
      )}
    </li>
  )
}

/**
 * One list, folded where it is long enough to be a wall.
 *
 * Below the threshold nothing is hidden and no disclosure renders, so most
 * polities see exactly what they saw before.
 */
function Folded({ list, noun }: { list: Contemporary[]; noun: string }) {
  const byDate = (a: Contemporary, b: Contemporary) =>
    a.span.from - b.span.from || a.name.localeCompare(b.name)

  if (list.length <= FOLD_ABOVE) {
    return (
      <ul className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
        {list.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ul>
    )
  }

  const longest = [...list]
    .sort((a, b) => b.certainYears - a.certainYears || a.name.localeCompare(b.name))
    .slice(0, SHOWN)
  const shownIds = new Set(longest.map((c) => c.id))
  const shown = longest.sort(byDate)
  const rest = list.filter((c) => !shownIds.has(c.id)).sort(byDate)

  return (
    <>
      <ul className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
        {shown.map((c) => (
          <Row key={c.id} c={c} />
        ))}
      </ul>

      <p className="mt-3 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        The {SHOWN} that {noun} longest, in date order.
      </p>

      <details className="mt-2 group">
        <summary className="inline-block cursor-pointer font-mono text-micro uppercase tracking-[0.08em] text-firuze-ink hover:text-kashi">
          Show the remaining {rest.length}
        </summary>
        <ul className="mt-3 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {rest.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </ul>
      </details>
    </>
  )
}

export function Contemporaries({
  certain,
  possible,
}: {
  certain: Contemporary[]
  possible: Contemporary[]
}) {
  if (!certain.length && !possible.length) {
    return (
      <section aria-labelledby="contemporaries-heading" className="mt-16">
        <SectionHead ground="paper" id="contemporaries-heading">
          Contemporaries
        </SectionHead>
        <p className="max-w-measure text-body">
          Nothing else on these pages overlaps this polity&rsquo;s span.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="contemporaries-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="contemporaries-heading"
        aside={
          <span className="font-mono text-micro uppercase text-debu-ink">
            {certain.length + possible.length} overlapping
          </span>
        }
      >
        Contemporaries
      </SectionHead>

      {certain.length ? <Folded list={certain} noun="overlapped" /> : null}

      {/* The honest half. Both spans are ranges, and for these two the answer
          depends on which cited date you accept — so the page says that
          instead of picking one and printing a fact. */}
      {possible.length ? (
        <div className="mt-6 border-t border-kashi/15 pt-4">
          <h3 className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-debu-ink">
            Possibly, depending on which dates you accept
          </h3>
          <div className="mt-2">
            <Folded list={possible} noun="may have overlapped" />
          </div>
        </div>
      ) : null}

      <p className="mt-5 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        Derived from cited spans, not from a separate source. Where both spans
        are ranges and they meet only on the widest reading of each, the pair is
        listed as possible rather than resolved to one answer. Unlinked entries
        are here for scale and are not written up.
      </p>
    </section>
  )
}
