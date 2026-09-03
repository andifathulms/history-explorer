import type { Metadata } from 'next'
import Link from 'next/link'
import { loadCorpus, hasPage, displayName } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { END_TYPES, type EndType } from '@/lib/types'
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

export default function Endings() {
  const { all, regions } = loadCorpus()
  const ended = all.filter((p) => p.ended)
  const byType = new Map<EndType, typeof ended>()
  for (const t of END_TYPES) byType.set(t, [])
  for (const p of ended) byType.get(p.ended!.type)!.push(p)
  const max = Math.max(...END_TYPES.map((t) => byType.get(t)!.length))
  const conquered = byType.get('conquest')!.length
  const otherwise = ended.length - conquered
  const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? id

  return (
    <div className="ground-paper min-h-screen">
      <SiteNav ground="paper" current="Endings" />
      <main id="main" className="mx-auto w-full max-w-shell px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">Endings</h1>
        <p className="mt-3 max-w-measure text-body">
          Every polity here records how it stopped, typed from a closed list of six rather
          than described in prose, so that it can be counted. {ended.length} of{' '}
          {all.length} carry one.
        </p>
        <p className="mt-4 max-w-measure text-body">
          The vocabulary was fixed before most of this corpus existed, which is what makes
          the tally worth reading: it was not shaped to fit the answer. As it stands,{' '}
          <span className="tabular-nums">{conquered}</span> polities here were ended by an
          outside power and <span className="tabular-nums">{otherwise}</span> stopped some
          other way — an even split, which is itself the finding. The half that were not
          conquered came apart over an inheritance, dwindled into a formality, or were
          taken by the men they had hired to protect them.
        </p>

        <section className="mt-12">
          {END_TYPES.map((t) => {
            const ps = byType.get(t)!
            return (
              <div key={t} className="border-t border-kashi/15 py-6">
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <h2 className="text-[22px] italic text-kashi">{t}</h2>
                  <span className="tabular-nums text-debu-ink">
                    {ps.length} {ps.length === 1 ? 'polity' : 'polities'}
                  </span>
                </div>
                {/* Length is a cited quantity: the bar is the count. */}
                <div className="mt-2 h-[6px] max-w-[520px] rounded-full bg-kashi/10">
                  <span
                    className="block h-[6px] rounded-full bg-kashi/60"
                    style={{ width: `${max ? (ps.length / max) * 100 : 0}%` }}
                  />
                </div>
                <p className="mt-3 max-w-measure text-body">{GLOSS[t]}</p>
                {ps.length ? (
                  <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    {ps
                      .slice()
                      .sort((a, b) => (a.ended!.year ?? 0) - (b.ended!.year ?? 0))
                      .map((p) => (
                        <li key={p.id} className="text-[15px]">
                          <span className="tabular-nums text-debu-ink">
                            {p.ended!.year == null ? '—' : formatYear(p.ended!.year)}
                          </span>{' '}
                          {hasPage(p.id) ? (
                            <Link
                              href={`/polity/${p.id}/`}
                              className="text-kashi hover:text-firuze-ink"
                            >
                              {p.name.latin}
                            </Link>
                          ) : (
                            p.name.latin
                          )}
                          {p.ended!.by.length ? (
                            <span className="text-debu-ink">
                              {' '}
                              by {p.ended!.by.map((b) => displayName(b)).join(', ')}
                            </span>
                          ) : null}
                          <span className="text-debu-ink"> · {regionName(p.region)}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-[15px] text-debu-ink">
                    No polity in the corpus is typed this way yet. The word stays in the
                    vocabulary because removing it would change what the other five mean.
                  </p>
                )}
              </div>
            )
          })}
        </section>

        <section className="mt-12 max-w-measure">
          <h2 className="text-[22px] text-kashi">What the vocabulary cannot do</h2>
          <p className="mt-3 text-body">
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
      </main>
    </div>
  )
}
