import Link from 'next/link'
import { formatYear, formatRange } from '@/lib/years'
import {
  edgeParties,
  type Edge,
  type Ending,
  type ExternalNeighbour,
  type Polity,
  type Transfer,
} from '@/lib/types'
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
  if (!emphasise) return <span className="text-ink/80">{name}</span>
  return hasPage(id) ? (
    <Link
      href={`/polity/${id}/`}
      className="link-underline font-semibold text-kashi hover:text-firuze-ink"
    >
      {name}
    </Link>
  ) : (
    // Unlinked. The reason is stated once under the section rather than in a
    // `title` on every occurrence, which no touch reader could ever open.
    <span className="font-semibold text-debu-ink">{name}</span>
  )
}

/**
 * A predecessor or successor with no record here.
 *
 * Rendered in the same list as the edges and deliberately without a link or an
 * apology. What a reader wants from this section is what came before and what
 * came after; whether the answer happens to have its own page is not their
 * question. The row is quieter than an edge row because the claim is smaller —
 * a sourced sentence rather than a typed, drawable relation.
 */
const CONTESTED =
  'inline-flex items-center rounded-full border border-dashed border-debu/60 px-2 py-[3px] font-sans text-[11.5px] font-medium leading-none text-debu-ink'

/**
 * One neighbour, as a card. The rule down its inner edge is the thread's own
 * colour and points at the polity in the middle column, which is the one
 * place outside the thread itself that turquoise is used: this section is the
 * polity's piece of a thread.
 */
const EDGE_CARD =
  'card-paper relative px-4 py-3.5 before:absolute before:top-5 before:hidden before:h-[2px] before:w-6 before:bg-firuze lg:before:block'

function ExternalRow({ item, polity }: { item: ExternalNeighbour; polity: string }) {
  return (
    <li className={EDGE_CARD}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        {item.year == null ? null : (
          <span className="font-mono text-[14px] tabular-nums text-debu-ink">
            {formatYear(item.year)}
          </span>
        )}
        {item.type ? (
          <>
            <span className="text-ink/80">{polity}</span>
            <span className="italic text-firuze-ink">{item.type}</span>
          </>
        ) : null}
        <span className="font-display text-[17px] font-semibold text-kashi-deep">{item.name}</span>
        {item.contested ? <span className={CONTESTED}>Contested</span> : null}
      </p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{item.note}</p>
    </li>
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
    <li className={EDGE_CARD}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[14px] tabular-nums text-debu-ink">
          {edge.year == null ? '—' : formatYear(edge.year)}
        </span>
        <Party id={subject} emphasise={subject === other} />
        <span className="italic text-firuze-ink">{edge.type}</span>
        <Party id={object} emphasise={object === other} />
        {edge.contested ? <span className={CONTESTED}>Contested</span> : null}
      </p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-debu-ink">{edge.note}</p>
    </li>
  )
}

/**
 * What the ending names, when no edge carries it.
 *
 * Some polities stop because of somebody this collection does carry, and yet no
 * succession edge joins them: the vocabulary has eight types and none of them
 * describes what happened. Persis is the case that forced this. Its own king
 * beat his overlord and became king of kings, so Persis was not conquered, did
 * not fragment and was not replaced by another house — it stopped being a
 * separate kingdom by becoming the centre of an empire. Typing that as conquest
 * would put a false sentence into a drawn thread.
 *
 * The old fallback then told the reader that nothing continued from Persis,
 * three screens under a chapter naming exactly what did. So where `ended.by`
 * names somebody, this says so: a plain sentence about the past, no year of
 * transfer asserted beyond the one the ending already carries, and no edge, no
 * thread and no tally touched.
 */
function EndedBy({ ending }: { ending: Ending }) {
  return (
    <p className="mt-2 max-w-measure text-debu-ink">
      {ending.year == null ? null : (
        <>
          <span className="font-mono text-[14px] tabular-nums">{formatYear(ending.year)}</span>{' '}
          &mdash;{' '}
        </>
      )}
      ended by{' '}
      {ending.by.map((id, i) => (
        <span key={id}>
          {i > 0 ? (i === ending.by.length - 1 ? ' and ' : ', ') : null}
          {hasPage(id) ? (
            <Link
              href={`/polity/${id}/`}
              className="link-underline font-semibold text-kashi hover:text-firuze-ink"
            >
              {displayName(id)}
            </Link>
          ) : (
            <span className="font-semibold text-debu-ink">{displayName(id)}</span>
          )}
        </span>
      ))}
      .
    </p>
  )
}

/**
 * The same-object relation, stated inside Succession and explicitly not as one.
 *
 * It sits here because this is where a reader asks the question, and the copy
 * has to do the work the vocabulary cannot: say that the two records are one
 * thing without implying that one succeeded the other. No year is printed
 * because there is no year — nothing happened.
 *
 * The copy is addressed to a reader and names neither the field nor the edge
 * vocabulary, under hard rule 12: this string renders on every page of every
 * pair, and telling the reader how the data is stored was the habit the rule
 * was written against. See the note on `Polity.resumes` for the reasoning.
 */
function Resumption({ earlier, later }: { earlier?: Polity; later?: Polity }) {
  const other = earlier ?? later
  if (!other) return null
  const when = formatRange(other.span.start.min, other.span.end.max)
  return (
    <p className="mb-8 max-w-measure border-l-2 border-kashi/30 pl-4 text-body text-debu-ink">
      {earlier ? 'The same polity, earlier: ' : 'The same polity, later: '}
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
      <span className="tabular-nums">({when})</span> &mdash; the same ground and the same
      royal title, interrupted and then taken up again. Nothing was inherited and
      nothing was claimed, which is why no year is given: the country stopped
      being governed as itself, and later it was again, and there is no day on
      which that turned over.
    </p>
  )
}

export function Position({
  polity,
  predecessors,
  successors,
  resumes,
  resumedBy,
}: {
  polity: Polity
  predecessors: Edge[]
  successors: Edge[]
  resumes?: Polity
  resumedBy?: Polity
}) {
  const before = polity.preceded_by_external ?? []
  const after = polity.succeeded_by_external ?? []
  const name = polity.name.latin
  // No edges at all is an ordinary state, not an empty one — it is what most
  // polities outside a dense region will look like. Two columns of "no recorded
  // predecessor" would dress that up as a pair of absences; one sentence is the
  // truer shape, and it keeps the page from opening on a hole.
  const endedBy = polity.ended && polity.ended.by.length ? polity.ended : null
  // Whether any party named in this section is a record without a page, which
  // decides whether the note under the columns is worth printing.
  const unlinked = [...predecessors, ...successors]
    .flatMap((e) => [e.from, e.to])
    .concat(endedBy ? endedBy.by : [])
    .some((id) => id !== polity.id && !hasPage(id))
  if (
    !predecessors.length &&
    !successors.length &&
    !before.length &&
    !after.length &&
    !endedBy
  ) {
    return (
      <section aria-labelledby="position-heading" className="mt-16">
        <SectionHead ground="paper" id="position-heading">
          Succession
        </SectionHead>
        <Resumption earlier={resumes} later={resumedBy} />
        {/* Hard rule 7 asks for one plain sentence here, and hard rule 12
            forbids that sentence being about what this collection holds. So
            the subject is the evidence, which rule 11 allows and which is
            what is actually true: the sources consulted carry no line of
            descent at either end. The phrasing follows Institutions, where a
            gap reads as no source consulted addressing the question. */}
        <p className="max-w-measure text-body">
          No source consulted for this polity carries a line of descent into it or
          out of it. Inheriting a predecessor&rsquo;s claim, and leaving one behind, is
          something some polities did and many did not.
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

      {/* Before, the polity, after. On a wide screen the polity stands in the
          middle column and each neighbour's card points at it; narrower, the
          three stack in reading order. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_11rem_minmax(0,1fr)] lg:gap-0">
        <div className="lg:pe-6 [&_li]:before:-right-6">
          <h3 className="label mb-2.5 text-debu-ink">What led here</h3>
          {predecessors.length || before.length ? (
            <ul className="space-y-2.5">
              {predecessors.map((e, i) => (
                <EdgeRow key={i} edge={e} other={e.from} />
              ))}
              {before.map((x, i) => (
                <ExternalRow key={`x${i}`} item={x} polity={name} />
              ))}
            </ul>
          ) : resumes ? (
            <p className="mt-2 text-debu-ink">
              What led here is the earlier record of this same polity, named above.
            </p>
          ) : (
            <p className="mt-2 text-debu-ink">
              No earlier polity is recorded as leading here.
            </p>
          )}
        </div>

        <div className="lg:sticky lg:top-40 lg:pt-8">
          <div className="rounded-xl bg-kashi-deep px-4 py-4 text-center text-kaghaz shadow-paper">
            <p className="font-display text-[18px] font-semibold leading-tight">{name}</p>
            <p className="mt-1 font-mono text-[12px] tabular-nums text-kaghaz/70">
              {formatRange(polity.span.start.min, polity.span.end.max)}
            </p>
          </div>
        </div>

        <div className="lg:ps-6 [&_li]:before:-left-6">
          <h3 className="label mb-2.5 text-debu-ink">What led away</h3>
          {successors.length || after.length ? (
            <ul className="space-y-2.5">
              {successors.map((e, i) => (
                <EdgeRow key={i} edge={e} other={e.to} />
              ))}
              {after.map((x, i) => (
                <ExternalRow key={`x${i}`} item={x} polity={name} />
              ))}
            </ul>
          ) : resumedBy ? (
            <p className="mt-2 text-debu-ink">
              What led away is the later record of this same polity, named above.
            </p>
          ) : endedBy ? (
            <EndedBy ending={endedBy} />
          ) : (
            <p className="mt-2 text-debu-ink">
              No later polity is recorded as continuing from here.
            </p>
          )}
        </div>
      </div>

      {unlinked ? (
        <p className="mt-6 max-w-measure text-[14px] leading-relaxed text-debu-ink">
          A name set in dust rather than as a link is one this thread carries for
          the shape of the era and has no chapters for.
        </p>
      ) : null}
    </section>
  )
}

/**
 * Territory that changed hands, where the polity that lost it went on existing.
 *
 * Its own section, below succession and visibly not part of it. Byzantium lost
 * Syria, Egypt, Anatolia and Sicily and none of that is succession; putting
 * these rows in the "what led here" columns would read as descent, which is
 * exactly the misreading `Transfer` exists to avoid. The heading says what the
 * relation is so the reader never has to infer it.
 *
 * A polity with no transfers renders nothing at all. There is no empty state
 * here on purpose: never having lost a province is not a gap in the record,
 * and most polities in this corpus will carry none.
 */
function TransferRow({ item, subject }: { item: Transfer; subject: 'lost' | 'gained' }) {
  const other = subject === 'lost' ? item.to : item.from
  return (
    <li className="card-paper px-4 py-3.5">
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-mono text-[14px] tabular-nums text-debu-ink">
          {item.year == null ? '\u2014' : formatYear(item.year)}
        </span>
        <span className="font-semibold text-ink">{item.what}</span>
        <span className="italic text-kashi">{subject === 'lost' ? 'to' : 'from'}</span>
        <Party id={other} emphasise />
        {item.contested ? <span className={CONTESTED}>Contested</span> : null}
      </p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-debu-ink">{item.note}</p>
    </li>
  )
}

export function Transfers({ lost, gained }: { lost: Transfer[]; gained: Transfer[] }) {
  if (!lost.length && !gained.length) return null
  return (
    <section aria-labelledby="transfers-heading" className="mt-16">
      <SectionHead ground="paper" id="transfers-heading">
        Territory that changed hands
      </SectionHead>
      <p className="max-w-measure text-body">
        {lost.length
          ? 'Provinces lost while this polity went on existing. '
          : 'Provinces taken from polities that went on existing. '}
        This is not succession and draws no thread &mdash; territory changing hands
        says nothing about what became what.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {lost.length ? (
          <div>
            <h3 className="label mb-2.5 text-debu-ink">Lost</h3>
            <ul className="space-y-2.5">
              {lost.map((t, i) => (
                <TransferRow key={i} item={t} subject="lost" />
              ))}
            </ul>
          </div>
        ) : null}
        {gained.length ? (
          <div>
            <h3 className="label mb-2.5 text-debu-ink">Taken</h3>
            <ul className="space-y-2.5">
              {gained.map((t, i) => (
                <TransferRow key={i} item={t} subject="gained" />
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
