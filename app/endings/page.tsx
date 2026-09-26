import type { Metadata } from 'next'
import Link from 'next/link'
import { loadCorpus, hasPage, displayName } from '@/lib/content'
import { Page, Shell, PageHero } from '@/components/Shell'
import { END_TYPES, type EndType, type Polity } from '@/lib/types'
import { formatYear } from '@/lib/years'

export const metadata: Metadata = {
  title: 'Endings',
  description:
    'How polities stopped: a closed vocabulary of six, counted across the corpus.',
}

/** Why each word exists, in the terms the coding decisions actually used. */
const GLOSS: Record<EndType, string> = {
  conquest: 'An outside power took it and it did not continue. The plainest case, and the largest single group.',
  fragmentation: 'Nobody defeated it. Its parts stopped taking instructions — usually over an inheritance.',
  'dynastic replacement': 'The institution survived and the family holding it did not.',
  'gradual absorption': 'Reduced to a client, then to a formality, then to nothing, over decades.',
  'internal usurpation': 'Ended by its own servants: a minister, a guard regiment, a purchased army.',
  'still contested': 'Scholarship does not agree that it ended, or when.',
}

/**
 * How each type reads inside the summary sentence, as a verb phrase.
 *
 * Typed Record<EndType, string> on purpose: the sentence used to name three of
 * the four non-conquest categories and claim to have described the half, which
 * on a page whose argument is that the tally is exact is not a rounding error.
 * Building it from the vocabulary means a seventh end type cannot be added
 * without the compiler asking what it does to this sentence.
 */
const CLAUSE: Record<EndType, string> = {
  conquest: 'were taken by an outside power',
  fragmentation: 'came apart over an inheritance',
  'gradual absorption': 'dwindled into a formality',
  'internal usurpation': 'were taken by the men they had hired to protect them',
  // No internal "and" or comma in any clause: they are joined into one
  // sentence, and a conjunction inside a list item reads as a list separator.
  'dynastic replacement': 'kept the institution but not the family holding it',
  'still contested': 'have no ending scholarship agrees on',
}

/** How many of a type show before the fold, and when folding is worth it. */
const SHOWN = 12
const FOLD_ABOVE = 16

function EndingRow({ p, region }: { p: Polity; region: string }) {
  return (
    <li className="grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-3 border-b border-kashi/10 py-2.5 text-[15px] leading-snug">
      <span className="pt-px font-mono text-[12.5px] tabular-nums text-debu-ink">
        {p.ended!.year == null ? '—' : formatYear(p.ended!.year)}
      </span>
      <span className="min-w-0">
        {hasPage(p.id) ? (
          <Link
            href={`/polity/${p.id}/`}
            className="font-semibold text-kashi-deep hover:text-firuze-ink"
          >
            {p.name.latin}
          </Link>
        ) : (
          <span className="font-semibold">{p.name.latin}</span>
        )}
        {p.ended!.by.length ? (
          <span className="text-debu-ink">
            {' '}
            by {p.ended!.by.map((b: string) => displayName(b)).join(', ')}
          </span>
        ) : null}
        <span className="mt-0.5 block font-sans text-[12px] text-debu-ink">
          {region}
        </span>
      </span>
    </li>
  )
}

export default function Endings() {
  const { all, regions } = loadCorpus()
  const ended = all.filter((p) => p.ended)
  const byType = new Map<EndType, typeof ended>()
  for (const t of END_TYPES) byType.set(t, [])
  for (const p of ended) byType.get(p.ended!.type)!.push(p)
  const max = Math.max(...END_TYPES.map((t) => byType.get(t)!.length))
  const conquered = byType.get('conquest')!.length
  const otherwise = ended.length - conquered
  // The non-conquest half, enumerated from the vocabulary rather than by hand,
  // so the parts always sum to the whole. Empty types are skipped: "0 have no
  // ending scholarship agrees on" is noise, and the type still gets its own
  // section below where the zero is the point.
  const rest = END_TYPES.filter((t) => t !== 'conquest' && byType.get(t)!.length > 0)
    .map((t) => ({ type: t, count: byType.get(t)!.length, clause: CLAUSE[t] }))
    // Largest first. A breakdown read as "19, 3, 8, 3" makes the reader stop and
    // check; the sections below keep vocabulary order, where it belongs.
    .sort((a, b) => b.count - a.count || END_TYPES.indexOf(a.type) - END_TYPES.indexOf(b.type))
  const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? id

  return (
    <Page ground="paper" nav="dark" current="Endings">
      <main id="main" className="flex-1">
        <PageHero kicker="A closed vocabulary of six" title="Endings">
          <p>
          Every polity here records how it stopped, typed from a closed list of six rather
          than described in prose, so that it can be counted. {ended.length} of{' '}
              {all.length} carry one.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-kaghaz/60">
              The vocabulary was fixed before most of this corpus existed, which is what
              makes the tally worth reading: it was not shaped to fit the answer. As it
              stands, <span className="tabular-nums">{conquered}</span> polities here were
              ended by an outside power and{' '}
              <span className="tabular-nums">{otherwise}</span> stopped some other way — an
              even split, which is itself the finding.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-kaghaz/60">
              That second half divides again:{' '}
              {rest.map((r, i) => (
                <span key={r.type}>
                  {i > 0 ? (i === rest.length - 1 ? ' and ' : ', ') : ''}
                  <span className="tabular-nums">{r.count}</span> {r.clause}
                </span>
              ))}
              .
            </p>
        </PageHero>
        <Shell className="pb-24">

        <section className="mt-16">
          {/* All six at a glance first: one bar, a segment per type, each as
              long as its count and each a link to its section. The same
              counts as the bars below, laid end to end so the split the lede
              describes can be seen rather than read. */}
          <nav aria-label="Ending types" className="card-paper mb-10 px-5 py-5 sm:px-6">
            <div aria-hidden="true" className="flex h-3 overflow-hidden rounded-full">
              {END_TYPES.map((t, i) => (
                <span
                  key={t}
                  className={i % 2 ? 'bg-kashi-soft' : 'bg-kashi'}
                  style={{ width: `${(byType.get(t)!.length / ended.length) * 100}%` }}
                />
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {END_TYPES.map((t, i) => (
                <li key={t}>
                  <a
                    href={`#${t.replace(/ /g, '-')}`}
                    className="flex items-center gap-2 font-sans text-[13.5px] font-medium text-kashi-deep hover:text-firuze-ink"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-sm ${i % 2 ? 'bg-kashi-soft' : 'bg-kashi'}`}
                    />
                    {t}
                    <span className="font-mono text-[12px] tabular-nums text-debu-ink">
                      {byType.get(t)!.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-6">
          {END_TYPES.map((t) => {
            const ps = byType
              .get(t)!
              .slice()
              .sort((a, b) => (a.ended!.year ?? 0) - (b.ended!.year ?? 0))
            // A long type folds, the way contemporaries do: two hundred and
            // twenty-five names in three columns was a wall, not a list.
            const shown = ps.length > FOLD_ABOVE ? ps.slice(0, SHOWN) : ps
            const rest = ps.length > FOLD_ABOVE ? ps.slice(SHOWN) : []
            return (
              <section
                key={t}
                id={t.replace(/ /g, '-')}
                aria-labelledby={`${t.replace(/ /g, '-')}-heading`}
                className="card-paper scroll-mt-24 px-5 py-6 sm:px-7"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h2
                    id={`${t.replace(/ /g, '-')}-heading`}
                    className="font-display text-title font-semibold italic text-kashi-deep"
                  >
                    {t}
                  </h2>
                  <span className="font-sans text-[13px] text-debu-ink">
                    <span className="font-mono tabular-nums">{ps.length}</span>{' '}
                    {ps.length === 1 ? 'polity' : 'polities'}
                  </span>
                </div>
                {/* Length is a cited quantity: the bar is the count. */}
                <div className="mt-4 h-2 max-w-[620px] rounded-full bg-kashi/10">
                  <span
                    className="block h-2 rounded-full bg-kashi/60"
                    style={{ width: `${max ? (ps.length / max) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-4 max-w-measure text-body">{GLOSS[t]}</p>
                {ps.length ? (
                  <>
                    <ul className="mt-5 grid gap-x-10 border-t border-kashi/10 md:grid-cols-2">
                      {shown.map((p) => (
                        <EndingRow key={p.id} p={p} region={regionName(p.region)} />
                      ))}
                    </ul>
                    {rest.length ? (
                      <details className="mt-4">
                        <summary className="inline-block cursor-pointer font-sans text-[13.5px] font-semibold text-firuze-ink hover:text-kashi">
                          Show the remaining {rest.length}
                        </summary>
                        <ul className="mt-2 grid gap-x-10 md:grid-cols-2">
                          {rest.map((p) => (
                            <EndingRow key={p.id} p={p} region={regionName(p.region)} />
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-3 text-[15px] text-debu-ink">
                    No polity in the corpus is typed this way yet. The word stays in the
                    vocabulary because removing it would change what the other five mean.
                  </p>
                )}
              </section>
            )
          })}
          </div>
        </section>

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
            What the vocabulary cannot do
          </h2>
          <p className="mt-4 text-body">
            It types the last act, not the process. The Karakhanids are recorded as{' '}
            <em>conquest</em> because the Khwarazmshah removed their last rulers in 1212,
            after a century in which they had been reduced to a title held under somebody
            else&rsquo;s protection. Their chapter says so. A vocabulary fine enough to
            catch that would be prose, and prose cannot be counted.
          </p>
          <p className="mt-4 text-body">
            An empty <code className="text-[15px]">by</code> is also doing work. Where a
            polity was ended by something real that this site has not read a source for —
            the Kyrgyz who broke the Uyghurs, the Rus who took Atil — the field is left
            empty and the agent is named in the chapter, rather than given an identifier
            that resolves to nothing.
          </p>
        </section>
        </Shell>
      </main>
    </Page>
  )
}
