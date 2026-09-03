import type { Metadata } from 'next'
import Link from 'next/link'
import { loadCorpus, politiesInRegion, getChapters } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { formatKm2, formatPopulation } from '@/lib/gaps'

export const metadata: Metadata = {
  title: 'Polities',
  description: 'Every polity on the site, grouped by region, with what is cited for each.',
}

export default function PolitiesIndex() {
  const { regions } = loadCorpus()

  return (
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="Polities" />
      <main id="main" className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">Polities</h1>
        <p className="mt-3 max-w-measure text-body">
          Everything the site has actually read a source for. Each has chapters, facts, a
          peak-extent map and a rating panel. Regions are a browsing convenience, not a
          claim that the polities inside one were a single civilisation.
        </p>

        {regions.map((r) => {
          const ps = politiesInRegion(r.id).filter((p) => !p.context_only)
          const ctx = politiesInRegion(r.id).filter((p) => p.context_only)
          return (
            <section key={r.id} className="mt-14">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <h2 className="text-[22px] text-kashi">{r.name}</h2>
                {r.thread ? (
                  <Link
                    href={`/continuity/${r.id}/`}
                    className="text-[15px] text-firuze-ink hover:underline"
                  >
                    walk the thread →
                  </Link>
                ) : null}
              </div>

              <ul className="mt-6">
                {ps.map((p) => {
                  const n = getChapters(p.id).length
                  return (
                    <li
                      key={p.id}
                      className="border-t border-kashi/15 py-5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <Link
                          href={`/polity/${p.id}/`}
                          className="text-[20px] font-semibold text-kashi hover:text-firuze-ink"
                        >
                          {p.name.latin}
                        </Link>
                        {p.name.script ? (
                          <span lang={p.name.script_lang ?? 'fa'} className="text-[19px] text-kashi/75">
                            {p.name.script}
                          </span>
                        ) : null}
                        <span className="tabular-nums text-[15px] text-debu-ink">
                          {p.span.start.min} – {p.span.end.max}
                        </span>
                      </div>
                      <p className="mt-2 max-w-measure text-body">{p.identity}</p>
                      <p className="mt-2 text-[14px] text-debu-ink">
                        {n} chapter{n === 1 ? '' : 's'} · reach{' '}
                        {formatKm2(p.measures.reach_km2?.value ?? null)} · population{' '}
                        {formatPopulation(p.measures.peak_population?.value ?? null)}
                      </p>
                    </li>
                  )
                })}
              </ul>

              {ctx.length ? (
                <p className="mt-6 max-w-measure text-[15px] text-debu-ink">
                  Also in this region as context, with figures and a place on the timeline
                  but no chapters yet: {ctx.map((p) => p.name.latin).join(', ')}.
                </p>
              ) : null}
            </section>
          )
        })}
      </main>
    </div>
  )
}
