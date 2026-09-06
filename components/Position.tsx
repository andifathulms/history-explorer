import Link from 'next/link'
import { formatYear, formatRange } from '@/lib/years'
import { edgeParties, type Edge, type Polity } from '@/lib/types'
import { displayName, hasPage } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

/**
 * Succession — PRD section 4, item 2.
 *
 * The edge type is stated in plain words rather than hidden behind a tooltip,
 * because the type *is* the causation and it is the reason this site exists.
 * A polity pair with two edges gets two rows; collapsing them would lose the
 * hundred and seventy-five years between Ghazna making the Ghurids its client
 * and the Ghurids ending Ghazna.
 */
/** One party in the sentence: linked where it has a page, plain where it does not. */
function Party({ id, emphasise }: { id: string; emphasise: boolean }) {
  const name = displayName(id)
  if (!emphasise) return <span className="text-dawat/70">{name}</span>
  return hasPage(id) ? (
    <Link
      href={`/polity/${id}/`}
      className="link-underline font-semibold text-kashi hover:text-firuze-ink"
    >
      {name}
    </Link>
  ) : (
    <span
      className="font-semibold text-debu-ink"
      title="No page: context polity or reference backdrop"
    >
      {name}
    </span>
  )
}

/**
 * Both parties are named, in the order the edge type's wording requires.
 *
 * The row used to print the type and the other polity, leaving this page's
 * polity as the implicit subject. That reads correctly for seven of the eight
 * types and inverts the eighth: "900 conquered by Saffarid Dynasty" stood on
 * the Samanid page directly above a note saying Isma'il b. Ahmad defeated Amr
 * b. al-Layth at Balkh. Naming both ends costs a few words and cannot be read
 * backwards.
 */
function EdgeRow({ edge, other }: { edge: Edge; other: string }) {
  const { subject, object } = edgeParties(edge)
  return (
    <li className="border-t border-kashi/15 py-3 first:border-t-0">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[14px] tabular-nums text-debu-ink">
          {edge.year == null ? '—' : formatYear(edge.year)}
        </span>
        <Party id={subject} emphasise={subject === other} />
        <span className="italic text-kashi">{edge.type}</span>
        <Party id={object} emphasise={object === other} />
        {edge.contested ? (
          <span className="rounded-full border border-debu/50 px-2 py-0.5 font-mono text-micro uppercase text-debu-ink">
            contested
          </span>
        ) : null}
      </p>
      <p className="mt-1 max-w-measure text-[16px] leading-relaxed text-debu-ink">{edge.note}</p>
    </li>
  )
}

/**
 * The same-object relation, stated inside Succession and explicitly not as one.
 *
 * It sits here because this is where a reader asks the question, and the copy
 * has to do the work the vocabulary cannot: say that the two records are one
 * thing without implying that one succeeded the other. No year is printed
 * because there is no year — nothing happened. See the note on `Polity.resumes`.
 */
function Resumption({ earlier, later }: { earlier?: Polity; later?: Polity }) {
  const other = earlier ?? later
  if (!other) return null
  const when = formatRange(other.span.start.min, other.span.end.max)
  return (
    <p className="mb-8 max-w-measure border-l-2 border-kashi/30 pl-4 text-body text-debu-ink">
      {earlier ? 'This record continues ' : 'This record is continued by '}
      {hasPage(other.id) ? (
        <Link
          href={`/polity/${other.id}/`}
          className="link-underline font-semibold text-kashi hover:text-firuze-ink"
        >
          {displayName(other.id)}
        </Link>
      ) : (
        <span className="font-semibold text-debu-ink">{displayName(other.id)}</span>
      )}{' '}
      <span className="tabular-nums">({when})</span> — the same ground, the same gods
      and the same royal title, resuming after an interruption. That is not a
      succession and it is not a claim, so it is not an edge and no thread draws
      it. There is no date on it because nothing happened.
    </p>
  )
}

export function Position({
  predecessors,
  successors,
  resumes,
  resumedBy,
}: {
  predecessors: Edge[]
  successors: Edge[]
  resumes?: Polity
  resumedBy?: Polity
}) {
  // No edges at all is an ordinary state, not an empty one — it is what most
  // polities outside a dense region will look like. Two columns of "no recorded
  // predecessor" would dress that up as a pair of absences; one sentence is the
  // truer shape, and it keeps the page from opening on a hole.
  if (!predecessors.length && !successors.length) {
    return (
      <section aria-labelledby="position-heading" className="mt-16">
        <SectionHead ground="paper" id="position-heading">
          Succession
        </SectionHead>
        <Resumption earlier={resumes} later={resumedBy} />
        <p className="max-w-measure text-body">
          No sourced succession edge runs into or out of this polity. That is a statement
          about what this site has read, not about the polity: it stands on its own here,
          and is measured on the same axes as everything else.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="position-heading" className="mt-16">
      <SectionHead ground="paper" id="position-heading">
        Succession
      </SectionHead>

      <Resumption earlier={resumes} later={resumedBy} />

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="font-display text-[19px] font-semibold text-kashi-deep">
            What led here
          </h3>
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
          <h3 className="font-display text-[19px] font-semibold text-kashi-deep">
            What led away
          </h3>
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
