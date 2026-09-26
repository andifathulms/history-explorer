import type { Metadata } from 'next'
import Link from 'next/link'
import { formatSpan } from '@/lib/years'
import {
  loadCorpus,
  politiesInRegion,
  getChapters,
  regionsByGroup,
  isPopulatedRegion,
} from '@/lib/content'
import { END_TYPES } from '@/lib/types'
import { Page, Shell, HeroBand } from '@/components/Shell'
import { CrossCut, type CrossCutPolity } from '@/components/CrossCut'
import { RegionNav, type NavGroup } from '@/components/RegionNav'
import { PolityBrowser } from '@/components/PolityBrowser'
import { PolityCard } from '@/components/PolityCard'
import { RegionLanes } from '@/components/RegionLanes'

export const metadata: Metadata = {
  title: 'Polities',
  description: 'Every polity on the site, grouped by region, with what is cited for each.',
}

/** Width of one column in the hero's density strip, in years. */
const BIN = 50

export default function PolitiesIndex() {
  const { regions, narrative } = loadCorpus()
  // One ordering for the nav and the sections below it. A contents list that
  // does not run in the order of the thing it indexes is worse than no
  // contents list.
  const groups = regionsByGroup((r) => isPopulatedRegion(r.id))
  const regionCount = groups.reduce((n, g) => n + g.regions.length, 0)

  /**
   * What the cards can actually show, counted rather than assumed.
   *
   * Every card used to carry three measures and only one of them was ever
   * populated: `peak_population` is null for almost every record, so nearly
   * every card printed "Population — No cited figure", burying the reach gap,
   * which is real and does draw a distinction.
   *
   * Hard rule 3 stands: a null is "No cited figure" and never a zero, wherever
   * the figure is the subject. It is the subject on a polity page. On a
   * browsing index a field with almost no values says nothing about any polity
   * in particular, so the coverage is stated once, in the hero's counts, and
   * counted at build — the cards carry a population line again on their own
   * account the day the field fills.
   */
  // The gutter's list, built from the same grouping the sections render under.
  const navGroups: NavGroup[] = groups.map((g) => ({
    id: g.id,
    name: g.name,
    regions: g.regions.map((r) => ({
      id: r.id,
      name: r.name,
      count: politiesInRegion(r.id).filter((p) => !p.context_only).length,
      thread: Boolean(r.thread),
    })),
  }))

  const withReach = narrative.filter((p) => p.measures.reach_km2?.value != null).length

  // The corpus's own extent is the axis every card's strip is drawn on, so a
  // strip says where in history a polity sat as well as how long it lasted.
  const lo = Math.min(...narrative.map((p) => p.span.start.min))
  const hi = Math.max(...narrative.map((p) => p.span.end.max))
  const axis: [number, number] = [lo, hi]
  const stripTicks = [-2000, -1000, 0, 1000].filter((y) => y > lo && y < hi)

  // Polities alive in each fifty-year bin. Counted, not cited — it is the
  // shape of the corpus, drawn so an era chip shows how much it selects.
  const binFrom = Math.floor(lo / BIN) * BIN
  const bins: number[] = []
  for (let y = binFrom; y <= hi; y += BIN) {
    bins.push(narrative.filter((p) => p.span.start.min < y + BIN && p.span.end.max >= y).length)
  }

  // Only the endings something actually ended by, in the vocabulary's order.
  const endings = END_TYPES.map((type) => ({
    type,
    count: narrative.filter((p) => p.ended?.type === type).length,
  })).filter((e) => e.count > 0)

  // Only what the cross-cut actually reads. Passing whole polities across the
  // server/client boundary would ship every chapter body into the bundle.
  const regionName = new Map(regions.map((r) => [r.id, r.name]))
  const crossCut: CrossCutPolity[] = narrative.map((p) => ({
    id: p.id,
    latin: p.name.latin,
    regionName: regionName.get(p.region) ?? p.region,
    institutions: p.institutions,
  }))

  const counts = [
    { value: narrative.length.toLocaleString('en-US'), label: 'polities' },
    { value: String(regionCount), label: 'regions' },
    {
      value: (hi - lo).toLocaleString('en-US'),
      label: `years, ${formatSpan(lo, hi)}`,
    },
    { value: String(withReach), label: 'with a cited extent' },
  ]

  return (
    <Page ground="paper" nav="dark" current="Polities">
      {/* The hero is where a reader orients and chooses; the shelves below are
          where they read. Dark above, paper below, and the change of ground
          says which is which without a label. */}
      <HeroBand>
        <Shell className="pb-8 pt-12 sm:pt-14">
          <div className="grid items-end gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <p className="kicker text-firuze-bright">The reading core</p>
              <h1 className="display-cut mt-3 font-display text-hero font-semibold text-kaghaz">
                Polities
              </h1>
              {/* Not "a peak-extent map". The map is the nearest snapshot to
                  the cited peak and the polity page says so in as many words,
                  because hard rule 5's whole argument rests on never letting a
                  drawn shape read as a measurement. */}
              <p className="mt-4 max-w-[52ch] text-lede text-kaghaz/85">
                Each one read from a named source, with chapters, cited figures and a
                snapshot map. Browse by region, narrow by era, or search by name in
                either script.
              </p>
            </div>
            <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-dawat-edge bg-dawat-raise/70 sm:grid-cols-4">
              {counts.map((c, i) => (
                <div
                  key={c.label}
                  className={`px-4 py-3.5 ${i % 2 ? 'border-s border-dawat-edge' : ''} ${
                    i > 1 ? 'border-t border-dawat-edge sm:border-t-0' : ''
                  } ${i === 2 ? 'sm:border-s' : ''}`}
                >
                  <dd className="font-mono text-[22px] leading-tight tabular-nums text-kaghaz">
                    {c.value}
                  </dd>
                  <dt className="mt-1 font-sans text-[12.5px] leading-snug text-debu-paper">
                    {c.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <PolityBrowser
            total={narrative.length}
            bins={bins}
            binFrom={binFrom}
            binSize={BIN}
            axis={axis}
            endings={endings}
          />

          {/* Said once, here, instead of on every card. */}
          <p className="mt-6 max-w-[80ch] border-t border-dawat-edge pt-4 font-sans text-[12.5px] leading-relaxed text-debu-paper">
            Regions are a browsing convenience, not a claim that the polities inside one
            were a single civilisation, and not a ranking. A region carries a thread only
            where sourced edges join two of its polities. Coverage claims no completeness.
          </p>
        </Shell>
      </HeroBand>

      <Shell className="flex-1 pb-24">
        <div className="flex gap-10">
          <aside className="hidden shrink-0 pt-12 lg:block lg:w-[232px]">
            <RegionNav groups={navGroups} />
          </aside>

          <main id="main" className="min-w-0 flex-1 pt-10">
            {/* Mobile only. On a wide screen the gutter carries the same links
                permanently, and two lists of them is one list too many; below
                `lg` there is no gutter, so this is the only way in and it
                stays. Folded, because fifty-seven rows is a page of its own. */}
            <details className="card-paper group mb-2 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-sans text-[14px] font-semibold text-kashi-deep">
                Jump to a region
                <span className="font-mono text-[12px] font-normal tabular-nums text-debu-ink">
                  {regionCount}
                </span>
              </summary>
              <nav aria-label="Regions" className="grid gap-x-8 gap-y-6 border-t border-kashi/10 px-5 pb-5 pt-4 sm:grid-cols-2">
                {groups.map((g) => (
                  <section key={g.id} aria-labelledby={`group-${g.id}`}>
                    <h2 id={`group-${g.id}`} className="label text-firuze-ink">
                      {g.name}
                    </h2>
                    <ul className="mt-1.5">
                      {g.regions.map((r) => {
                        const n = politiesInRegion(r.id).filter((p) => !p.context_only).length
                        return (
                          <li key={r.id} className="border-b border-kashi/10 last:border-b-0">
                            <a
                              href={`#${r.id}`}
                              data-nav-region={r.id}
                              className="flex items-baseline justify-between gap-4 py-2.5"
                            >
                              <span className="font-sans text-[15px] text-kashi">{r.name}</span>
                              <span className="font-mono text-[11px] tabular-nums text-debu-ink">
                                {String(n).padStart(2, '0')}
                              </span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </nav>
            </details>

            {/* The shelf headings are h2 and the regions under them h3: the
                group is a heading level, not a label, and a screen reader
                walking the outline should get the same tiers the eye does. */}
            {groups.map((g, gi) => (
              <div key={g.id} data-group={g.id}>
                <h2
                  className={`flex items-baseline gap-4 font-display text-[26px] font-semibold text-kashi-deep ${
                    gi === 0 ? 'mt-6' : 'mt-20'
                  }`}
                >
                  {g.name}
                  <span aria-hidden="true" className="h-px flex-1 translate-y-[-6px] bg-kashi/20" />
                </h2>
                {g.regions.map((r) => {
                  const inRegion = politiesInRegion(r.id)
                  const ps = inRegion.filter((p) => !p.context_only)
                  const ctx = inRegion.filter((p) => p.context_only)
                  const from = Math.min(...ps.map((p) => p.span.start.min))
                  const to = Math.max(...ps.map((p) => p.span.end.max))
                  return (
                    <section
                      key={r.id}
                      id={r.id}
                      data-region-section={r.id}
                      className="scroll-mt-24 pt-8"
                    >
                      <header className="card-paper px-5 pb-4 pt-5 sm:px-6">
                        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                          <div className="min-w-0">
                            <h3 className="font-display text-title font-semibold text-kashi-deep">
                              {r.name}
                            </h3>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className="tag border-kashi/20 text-kashi">
                                <span className="font-mono tabular-nums">{ps.length}</span>
                                {ps.length === 1 ? 'polity' : 'polities'}
                              </span>
                              <span className="tag border-kashi/20 font-mono tabular-nums text-kashi">
                                {formatSpan(from, to)}
                              </span>
                              {r.thread ? (
                                <span className="tag border-kashi/20 text-kashi">
                                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-firuze" />
                                  Has a thread
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {r.thread ? (
                            <Link
                              href={`/continuity/${r.id}/`}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-firuze-ink/30 bg-firuze/10 px-3.5 py-2.5 font-sans text-[14px] font-semibold leading-none text-firuze-ink transition-colors hover:bg-firuze/20"
                            >
                              Walk the thread <span aria-hidden="true">→</span>
                            </Link>
                          ) : null}
                        </div>

                        {r.blurb ? (
                          <p className="mt-3.5 max-w-[70ch] text-[16.5px] leading-relaxed text-debu-ink">
                            {r.blurb}
                          </p>
                        ) : null}

                        <RegionLanes polities={ps} />
                      </header>

                      <ul data-shelf="" className="pcards">
                        {ps.map((p) => (
                          <PolityCard
                            key={p.id}
                            polity={p}
                            regionName={r.name}
                            chapters={getChapters(p.id).length}
                            axis={axis}
                            ticks={stripTicks}
                          />
                        ))}
                      </ul>

                      {ctx.length ? (
                        /* A row of names with their spans, on the footing the
                           timeline already gives them, rather than a run-on
                           sentence that read as an apology. */
                        <div className="mt-4 px-1">
                          <p className="label text-debu-ink">
                            Also in this region, with figures and a place on the timeline
                          </p>
                          <ul className="mt-1.5 flex flex-wrap gap-x-7 gap-y-1">
                            {ctx.map((p) => (
                              <li key={p.id} className="py-1 text-[15px] text-debu-ink">
                                {p.name.latin}{' '}
                                <span className="font-mono text-[11.5px] tabular-nums">
                                  {formatSpan(p.span.start.min, p.span.end.max)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </section>
                  )
                })}
              </div>
            ))}

            <CrossCut polities={crossCut} />

            <div className="mt-20 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-kashi/15 pt-6 font-sans text-[13px] text-debu-ink">
              <p>
                <span className="font-mono tabular-nums">{narrative.length}</span> polities read ·{' '}
                <span className="font-mono tabular-nums">{regionCount}</span> regions
              </p>
              <a href="#main" className="font-medium transition-colors hover:text-firuze-ink">
                Back to top ↑
              </a>
            </div>
          </main>
        </div>
      </Shell>
    </Page>
  )
}
