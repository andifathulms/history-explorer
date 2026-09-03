import type { Metadata } from 'next'
import Link from 'next/link'
import { formatSpan } from '@/lib/years'
import { loadCorpus, politiesInRegion, getChapters } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'
import { formatKm2, formatPopulation } from '@/lib/gaps'

export const metadata: Metadata = {
  title: 'Polities',
  description: 'Every polity on the site, grouped by region, with what is cited for each.',
}

export default function PolitiesIndex() {
  const { regions, narrative } = loadCorpus()
  const populated = regions.filter((r) => politiesInRegion(r.id).some((p) => !p.context_only))

  return (
    <Page ground="paper" current="Polities">
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <PageHead kicker="The reading core" title="Polities" ground="paper">
            <p>
              Everything the site has actually read a source for. Each has chapters, facts,
              a peak-extent map and a rating panel.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-debu-ink">
              Regions are a browsing convenience, not a claim that the polities inside one
              were a single civilisation — and not a ranking. A region carries a thread
              only where sourced edges actually join two of its polities.
            </p>
          </PageHead>

          {/* Sixteen regions is more than a reader should have to scroll past to
              find one. Set as a wrapped line of capitals it was a grey block
              rather than a list — sixteen multi-word names at one weight, with
              nothing to tell them apart and no reason to prefer any. A column
              per region with its count reads as a contents page, which is what
              it is, and the count is the one fact that makes a region worth
              choosing from here. */}
          <nav aria-label="Regions" className="mt-12 border-t border-kashi/15 pt-8">
            <h2 className="kicker text-debu-ink">Jump to a region</h2>
            <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
              {populated.map((r) => {
                const n = politiesInRegion(r.id).filter((p) => !p.context_only).length
                return (
                  <li key={r.id} className="border-b border-kashi/10">
                    <a
                      href={`#${r.id}`}
                      className="group flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <span className="text-[16px] text-kashi transition-colors group-hover:text-firuze-ink">
                        {r.name}
                      </span>
                      <span className="font-mono text-micro tabular-nums text-debu-ink">
                        {String(n).padStart(2, '0')}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          {populated.map((r) => {
            const inRegion = politiesInRegion(r.id)
            const ps = inRegion.filter((p) => !p.context_only)
            const ctx = inRegion.filter((p) => p.context_only)
            return (
              <section key={r.id} id={r.id} className="scroll-mt-28 pt-20">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-kashi/25 pt-5">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="font-display text-title font-semibold text-kashi-deep">
                      {r.name}
                    </h2>
                    <span className="font-mono text-micro uppercase text-debu-ink">
                      {ps.length} {ps.length === 1 ? 'polity' : 'polities'}
                    </span>
                  </div>
                  {r.thread ? (
                    <Link
                      href={`/continuity/${r.id}/`}
                      className="link-underline font-mono text-[12.5px] uppercase tracking-[0.06em] text-firuze-ink"
                    >
                      Walk the thread →
                    </Link>
                  ) : null}
                </div>

                {r.blurb ? (
                  <p className="mt-4 max-w-measure text-[17px] leading-relaxed text-debu-ink">
                    {r.blurb}
                  </p>
                ) : null}

                {/* The grid draws its rules as 1px gaps over a tinted parent,
                    which means a part-filled last row leaves the tint showing
                    where a card should be. The fillers close the rectangle at
                    each column count; they are decoration, so they are hidden
                    from the accessibility tree. */}
                <ul className="mt-8 grid gap-px border border-kashi/12 bg-kashi/12 md:grid-cols-2 xl:grid-cols-3">
                  {ps.map((p) => {
                    const n = getChapters(p.id).length
                    return (
                      <li key={p.id} className="bg-kaghaz-raise">
                        <Link
                          href={`/polity/${p.id}/`}
                          className="group flex h-full flex-col p-6 transition-colors hover:bg-kaghaz-lift"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <h3 className="font-display text-[21px] font-semibold text-kashi-deep transition-colors group-hover:text-firuze-ink">
                              {p.name.latin}
                            </h3>
                            {p.name.script ? (
                              <span
                                lang={p.name.script_lang ?? 'fa'}
                                className="text-[19px] text-kashi/70"
                              >
                                {p.name.script}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1.5 font-mono text-micro uppercase tabular-nums text-firuze-ink">
                            {formatSpan(p.span.start.min, p.span.end.max)}
                          </p>
                          <p className="mb-5 mt-3 text-[16px] leading-relaxed text-dawat/80">
                            {p.identity}
                          </p>
                          {/* A dl rather than a run-on line: uppercase prose
                              turns "No cited figure" into shouting, and a gap
                              on this site is meant to be read calmly. */}
                          <dl className="mt-auto grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1 border-t border-kashi/12 pt-3.5 text-[13.5px]">
                            <dt className="font-mono text-micro uppercase text-debu-ink">
                              Chapters
                            </dt>
                            <dd className="font-mono tabular-nums text-dawat/75">{n}</dd>
                            <dt className="font-mono text-micro uppercase text-debu-ink">
                              Reach
                            </dt>
                            <dd
                              className={
                                p.measures.reach_km2?.value == null
                                  ? 'italic text-debu-ink'
                                  : 'font-mono tabular-nums text-dawat/75'
                              }
                            >
                              {formatKm2(p.measures.reach_km2?.value ?? null)}
                            </dd>
                            <dt className="font-mono text-micro uppercase text-debu-ink">
                              Population
                            </dt>
                            <dd
                              className={
                                p.measures.peak_population?.value == null
                                  ? 'italic text-debu-ink'
                                  : 'font-mono tabular-nums text-dawat/75'
                              }
                            >
                              {formatPopulation(p.measures.peak_population?.value ?? null)}
                            </dd>
                          </dl>
                        </Link>
                      </li>
                    )
                  })}
                  {Array.from({ length: (3 - (ps.length % 3)) % 3 }).map((_, i) => (
                    <li key={`f3-${i}`} aria-hidden className="hidden bg-kaghaz-raise xl:block" />
                  ))}
                  {Array.from({ length: (2 - (ps.length % 2)) % 2 }).map((_, i) => (
                    <li
                      key={`f2-${i}`}
                      aria-hidden
                      className="hidden bg-kaghaz-raise md:block xl:hidden"
                    />
                  ))}
                </ul>

                {ctx.length ? (
                  <p className="mt-6 max-w-measure text-[15px] leading-relaxed text-debu-ink">
                    Also in this region as context, with figures and a place on the timeline
                    but no chapters yet: {ctx.map((p) => p.name.latin).join(', ')}.
                  </p>
                ) : null}
              </section>
            )
          })}

          <p className="mt-20 border-t border-kashi/15 pt-6 font-mono text-micro uppercase text-debu-ink">
            {narrative.length} polities read · {populated.length} regions · coverage claims
            no completeness
          </p>
        </Shell>
      </main>
    </Page>
  )
}
