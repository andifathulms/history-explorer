import type { Metadata } from 'next'
import { formatSpan } from '@/lib/years'
import Link from 'next/link'
import { loadCorpus, politiesInRegion, edgesInRegion } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { EDGE_TYPES } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Continuity',
  description:
    'Typed, dated, cited succession — how one polity became the next, where a source says it did.',
}

export default function ContinuityIndex() {
  const { regions } = loadCorpus()
  const threaded = regions.filter((r) => r.thread)
  const unthreaded = regions.filter((r) => !r.thread)

  return (
    <div className="ground-dark min-h-screen">
      <SiteNav ground="dark" current="Continuity" />
      <main id="main" className="px-5 pb-24 pt-10 sm:px-8">
        <header className="max-w-measure">
          <h1 className="text-[32px] leading-tight text-kaghaz">Continuity</h1>
          <p className="mt-4 text-debu-paper">
            Wikipedia has an article on the Samanids and an article on the Ghaznavids. It
            does not have the thing that connects them: Alptigin was a Samanid Turkic
            slave-general who took Ghazna and founded a line that outlived his masters.
            That pattern — secession, usurpation by generals, vassals swallowing overlords
            — lives in the edges between articles, and this section is where it is written
            down.
          </p>
          <p className="mt-4 text-debu-paper">
            It is one section of this site, not the whole of it. Succession is something
            some polities have. A polity that seceded from nothing and was inherited by
            nobody still has a page and still enters the rankings; it simply does not
            appear here.
          </p>
        </header>

        <section className="mt-14">
          <h2 className="text-[13px] uppercase tracking-[0.14em] text-debu-paper">
            Threads
          </h2>
          <ul className="mt-5 max-w-measure">
            {threaded.map((r) => {
              const ps = politiesInRegion(r.id)
              const es = edgesInRegion(r.id)
              const from = Math.min(...ps.map((p) => p.span.start.min))
              const to = Math.max(...ps.map((p) => p.span.end.max))
              return (
                <li key={r.id} className="border-t border-kashi/40 py-6 first:border-t-0 first:pt-0">
                  <Link href={`/continuity/${r.id}/`} className="group">
                    <h3 className="text-[22px] text-kaghaz group-hover:text-firuze">
                      {r.name}
                    </h3>
                  </Link>
                  <p className="mt-1 tabular-nums text-[15px] text-debu-paper">
                    {formatSpan(from, to)} · {ps.length} polities · {es.length} sourced edges
                  </p>
                  <p className="mt-3 text-debu-paper">{r.blurb}</p>
                </li>
              )
            })}
          </ul>
        </section>

        {unthreaded.length ? (
          <section className="mt-16">
            <h2 className="text-[13px] uppercase tracking-[0.14em] text-debu-paper">
              Regions without a thread
            </h2>
            <p className="mt-4 max-w-measure text-debu-paper">
              These are complete, not unfinished. Their polities have pages and stand in
              the rankings like any other; no sourced succession edge yet joins two of
              them, which for most of history is the ordinary case.
            </p>
            <ul className="mt-6 grid max-w-[900px] gap-x-10 gap-y-4 sm:grid-cols-2">
              {unthreaded.map((r) => {
                const n = politiesInRegion(r.id).length
                return (
                  <li key={r.id} className="border-t border-kashi/30 pt-3">
                    <p className="text-[17px] text-kaghaz">{r.name}</p>
                    <p className="mt-1 text-[14px] text-debu-paper">
                      {n} {n === 1 ? 'polity' : 'polities'}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}


        <section className="mt-16 max-w-measure">
          <h2 className="text-[13px] uppercase tracking-[0.14em] text-debu-paper">
            The edge vocabulary
          </h2>
          <p className="mt-4 text-debu-paper">
            An edge is a claim about causation, so it is held to the same sourcing
            standard as prose: typed from a closed list, dated, explained in one sentence,
            and cited. Where scholarship disagrees on the nature of a transition, both
            edges are recorded and both marked contested rather than one being picked.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-2 text-[15px]">
            {EDGE_TYPES.map((t) => (
              <li key={t} className="rounded-sm border border-kashi/50 px-2.5 py-1 italic text-debu-paper">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
