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
 */

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
        <span className="text-debu-ink" title="Reference backdrop: numbers only, no page">
          {label}
        </span>
      )}
    </li>
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
          Nothing else in this corpus or its reference backdrop overlaps this
          polity&rsquo;s span. That is a statement about what has been entered
          here, not about the period.
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

      {certain.length ? (
        <ul className="columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {certain.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </ul>
      ) : null}

      {/* The honest half. Both spans are ranges, and for these two the answer
          depends on which cited date you accept — so the page says that
          instead of picking one and printing a fact. */}
      {possible.length ? (
        <div className="mt-6 border-t border-kashi/15 pt-4">
          <h3 className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-debu-ink">
            Possibly, depending on which dates you accept
          </h3>
          <ul className="mt-2 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
            {possible.map((c) => (
              <Row key={c.id} c={c} />
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        Derived from cited spans, not from a separate source. Where both spans
        are ranges and they meet only on the widest reading of each, the pair is
        listed as possible rather than resolved to one answer. Entries without a
        link are reference backdrop: numbers in the rankings, no page.
      </p>
    </section>
  )
}
