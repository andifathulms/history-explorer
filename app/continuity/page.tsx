import type { Metadata } from 'next'
import { formatSpan } from '@/lib/years'
import Link from 'next/link'
import { loadCorpus, politiesInRegion, edgesInRegion } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'
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
    <Page ground="dark" current="Continuity" wash>
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <PageHead kicker="One section, not the spine" title="Continuity" ground="dark">
            <p>
            Wikipedia has an article on the Samanids and an article on the Ghaznavids. It
            does not have the thing that connects them: Alptigin was a Samanid Turkic
            slave-general who took Ghazna and founded a line that outlived his masters.
            That pattern — secession, usurpation by generals, vassals swallowing overlords
            — lives in the edges between articles, and this section is where it is written
              down.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-debu-paper">
              It is one section of this site, not the whole of it. Succession is something
              some polities have. A polity that seceded from nothing and was inherited by
              nobody still has a page and still enters the rankings; it simply does not
              appear here.
            </p>
          </PageHead>

        <section className="mt-16">
          <h2 className="kicker border-t border-dawat-edge pt-5 text-debu-paper">Threads</h2>
          <ul className="mt-2 grid gap-px border border-dawat-edge bg-dawat-edge md:grid-cols-2">
            {threaded.map((r) => {
              const ps = politiesInRegion(r.id)
              const es = edgesInRegion(r.id)
              const from = Math.min(...ps.map((p) => p.span.start.min))
              const to = Math.max(...ps.map((p) => p.span.end.max))
              return (
                <li key={r.id} className="bg-dawat">
                  <Link
                    href={`/continuity/${r.id}/`}
                    className="group flex h-full flex-col p-7 transition-colors hover:bg-dawat-raise"
                  >
                    <h3 className="font-display text-[24px] font-semibold text-kaghaz transition-colors group-hover:text-firuze-bright">
                      {r.name}
                    </h3>
                    <p className="mt-2 font-mono text-micro uppercase tabular-nums text-firuze">
                      {formatSpan(from, to)} · {ps.length} polities · {es.length} edges
                    </p>
                    <p className="mt-4 text-[16px] leading-relaxed text-debu-paper">{r.blurb}</p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {unthreaded.length ? (
          <section className="mt-20">
            <h2 className="kicker border-t border-dawat-edge pt-5 text-debu-paper">
              Regions without a thread
            </h2>
            <p className="mt-5 max-w-measure text-[17px] leading-relaxed text-debu-paper">
              These are complete, not unfinished. Their polities have pages and stand in
              the rankings like any other; no sourced succession edge yet joins two of
              them, which for most of history is the ordinary case.
            </p>
            <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {unthreaded.map((r) => {
                const n = politiesInRegion(r.id).length
                return (
                  <li key={r.id} className="flex items-baseline justify-between gap-4 border-t border-dawat-edge pt-3">
                    <p className="text-[17px] text-kaghaz">{r.name}</p>
                    <p className="font-mono text-micro uppercase tabular-nums text-debu-paper">
                      {n} {n === 1 ? 'polity' : 'polities'}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}


        <section className="mt-20 max-w-measure">
          <h2 className="kicker border-t border-dawat-edge pt-5 text-debu-paper">
            The edge vocabulary
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-debu-paper">
            An edge is a claim about causation, so it is held to the same sourcing
            standard as prose: typed from a closed list, dated, explained in one sentence,
            and cited. Where scholarship disagrees on the nature of a transition, both
            edges are recorded and both marked contested rather than one being picked.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-2.5 gap-y-2">
            {EDGE_TYPES.map((t) => (
              <li key={t} className="rounded-full border border-dawat-edge px-3 py-1.5 font-mono text-micro uppercase text-debu-paper">
                {t}
              </li>
            ))}
          </ul>
        </section>
        </Shell>
      </main>
    </Page>
  )
}
