import Link from 'next/link'
import { formatYear } from '@/lib/years'
import type { Edge } from '@/lib/types'
import { displayName, hasPage } from '@/lib/content'

/**
 * Succession — PRD section 4, item 2.
 *
 * The edge type is stated in plain words rather than hidden behind a tooltip,
 * because the type *is* the causation and it is the reason this site exists.
 * A polity pair with two edges gets two rows; collapsing them would lose the
 * hundred and seventy-five years between Ghazna making the Ghurids its client
 * and the Ghurids ending Ghazna.
 */
function EdgeRow({ edge, other }: { edge: Edge; other: string }) {
  const name = displayName(other)
  return (
    <li className="border-t border-kashi/15 py-3 first:border-t-0">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="tabular-nums text-debu-ink">{edge.year == null ? '—' : formatYear(edge.year)}</span>
        <span className="italic text-kashi">{edge.type}</span>
        {hasPage(other) ? (
          <Link href={`/polity/${other}/`} className="font-semibold text-kashi hover:text-firuze-ink">
            {name}
          </Link>
        ) : (
          <span className="font-semibold text-debu-ink" title="No page: context polity or reference backdrop">
            {name}
          </span>
        )}
        {edge.contested ? (
          <span className="rounded-sm border border-debu/50 px-1.5 py-0.5 text-[12px] text-debu-ink">
            contested
          </span>
        ) : null}
      </p>
      <p className="mt-1 max-w-measure text-[16px] leading-relaxed text-debu-ink">{edge.note}</p>
    </li>
  )
}

export function Position({
  predecessors,
  successors,
}: {
  predecessors: Edge[]
  successors: Edge[]
}) {
  // No edges at all is an ordinary state, not an empty one — it is what most
  // polities outside a dense region will look like. Two columns of "no recorded
  // predecessor" would dress that up as a pair of absences; one sentence is the
  // truer shape, and it keeps the page from opening on a hole.
  if (!predecessors.length && !successors.length) {
    return (
      <section aria-labelledby="position-heading" className="mt-10">
        <h2 id="position-heading" className="text-[15px] uppercase tracking-widest text-debu-ink">
          Succession
        </h2>
        <p className="mt-3 max-w-measure text-body">
          No sourced succession edge runs into or out of this polity. That is a statement
          about what this site has read, not about the polity: it stands on its own here,
          and is measured on the same axes as everything else.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="position-heading" className="mt-10">
      <h2 id="position-heading" className="text-[15px] uppercase tracking-widest text-debu-ink">
        Succession
      </h2>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="text-[16px] font-semibold text-kashi">What led here</h3>
          {predecessors.length ? (
            <ul className="mt-2">
              {predecessors.map((e, i) => (
                <EdgeRow key={i} edge={e} other={e.from} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-debu-ink">
              No recorded predecessor. This polity enters from outside the corpus.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-kashi">What led away</h3>
          {successors.length ? (
            <ul className="mt-2">
              {successors.map((e, i) => (
                <EdgeRow key={i} edge={e} other={e.to} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-debu-ink">
              No recorded successor. Nothing in this corpus continues from here.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
