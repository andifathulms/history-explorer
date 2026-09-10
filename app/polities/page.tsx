import type { Metadata } from 'next'
import Link from 'next/link'
import { formatSpan, formatYear } from '@/lib/years'
import {
  loadCorpus,
  politiesInRegion,
  getChapters,
  regionsByGroup,
  isPopulatedRegion,
} from '@/lib/content'
import { scriptLang } from '@/lib/scripts'
import { Page, Shell, PageHead } from '@/components/Shell'
import { CrossCut, type CrossCutPolity } from '@/components/CrossCut'
import { formatKm2 } from '@/lib/gaps'

export const metadata: Metadata = {
  title: 'Polities',
  description: 'Every polity on the site, grouped by region, with what is cited for each.',
}

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
   * populated: `peak_population` is null for all 212 records, so 212 cards
   * printed "Population — No cited figure", and reach is cited for 60, so 152
   * more printed it for reach. Of 636 stat rows, 364 were that sentence.
   *
   * Hard rule 3 stands: a null is "No cited figure" and never a zero, wherever
   * the figure is the subject. It is the subject on a polity page, where the
   * gap says this polity's population is not known. On a browsing index a
   * field with no values anywhere says nothing about any polity in particular
   * — it is a column, not a gap, and repeating it 212 times buries the reach
   * gap, which is real and does draw a distinction.
   *
   * So the coverage is stated once, here, and counted at build the way the
   * rankings sliders count theirs — which means the page starts carrying a
   * population line again on its own, the day a figure is entered.
   */
  const withReach = narrative.filter((p) => p.measures.reach_km2?.value != null).length
  const withPopulation = narrative.filter(
    (p) => p.measures.peak_population?.value != null,
  ).length

  // Only what the cross-cut actually reads. Passing whole polities across the
  // server/client boundary would ship every chapter body into the bundle.
  const regionName = new Map(regions.map((r) => [r.id, r.name]))
  const crossCut: CrossCutPolity[] = narrative.map((p) => ({
    id: p.id,
    latin: p.name.latin,
    regionName: regionName.get(p.region) ?? p.region,
    institutions: p.institutions,
  }))

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
            {/* Said once, at the top, instead of once per card. Both figures
                are counted at build, so the sentence corrects itself. */}
            <p className="mt-4 text-[17px] leading-relaxed text-debu-ink">
              A cited extent exists for {withReach} of {narrative.length}.{' '}
              {withPopulation === 0
                ? 'No source consulted so far gives a peak population for any of them, so the cards carry no population line at all.'
                : `A peak population exists for ${withPopulation}.`}{' '}
              Coverage claims no completeness.
            </p>
          </PageHead>

          {/* Twenty-two regions is past what a contents list can carry, and the
              number only goes up. The earlier version set one region per cell
              in a three-column grid, which fixed the grey-block problem but
              left a new one: the grid flowed row-major, so a line read "The
              Iranian Intermezzo · The Caliphates · Iran before Islam" — three
              unrelated things adjacent because of the file order.

              Shelving them fixes both. Each block is a self-contained list, so
              there is no cross-column reading order to get wrong, and the
              headings give a reader something to aim at before they have
              learned twenty-two names. The shelves are geographic and carry no
              thread; see REGION_GROUPS in lib/types.ts for why that matters. */}
          <nav aria-label="Regions" className="mt-12 border-t border-kashi/15 pt-8">
            <h2 className="kicker text-debu-ink">Jump to a region</h2>
            <div className="mt-6 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => (
                <section key={g.id} aria-labelledby={`group-${g.id}`}>
                  <h3
                    id={`group-${g.id}`}
                    className="font-mono text-micro uppercase tracking-[0.08em] text-firuze-ink"
                  >
                    {g.name}
                  </h3>
                  <ul className="mt-2.5">
                    {g.regions.map((r) => {
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
                </section>
              ))}
            </div>
          </nav>

          <CrossCut polities={crossCut} />

          {/* The shelf headings repeat here so a reader who has scrolled past
              the nav still knows where they are. They are h2 and the regions
              under them are h3: the group is a heading level, not a label, and
              a screen reader walking the outline should get the same two tiers
              the eye does. */}
          {groups.map((g) => (
            <div key={g.id}>
              <h2 className="mt-24 border-t-2 border-kashi/30 pt-5 font-display text-[26px] font-semibold text-kashi-deep">
                {g.name}
              </h2>
              {g.regions.map((r) => {
            const inRegion = politiesInRegion(r.id)
            const ps = inRegion.filter((p) => !p.context_only)
            const ctx = inRegion.filter((p) => p.context_only)
            return (
              <section key={r.id} id={r.id} className="scroll-mt-28 pt-20">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-kashi/25 pt-5">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h3 className="font-display text-title font-semibold text-kashi-deep">
                      {r.name}
                    </h3>
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

                {/* Rules on the cells, not gaps over a tinted parent.

                    The tinted-parent trick needs filler cells to close the
                    rectangle whenever the last row is part-filled, and the
                    fillers were painted the same raised paper as a real card —
                    so a two-polity region in a three-column grid drew a blank
                    panel sitting exactly where a third polity would be. There
                    were 55 of them across the page.

                    Each cell draws its own top and left rule and the list
                    closes the rectangle with a right and a bottom. Same
                    lattice, nothing to fill: a short last row simply ends. */}
                <ul className="mt-8 grid border-b border-r border-kashi/12 md:grid-cols-2 xl:grid-cols-3">
                  {ps.map((p) => {
                    const n = getChapters(p.id).length
                    return (
                      <li
                        key={p.id}
                        className="border-l border-t border-kashi/12 bg-kaghaz-raise"
                      >
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
                                lang={p.name.script_lang ?? scriptLang(p.name.script ?? '')}
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
                            {/* How it ended, in place of the population line.
                                Coded for every record, one word, and the most
                                differentiating thing a card can carry — two
                                polities of the same size and century are told
                                apart by whether one was conquered and the
                                other fragmented. */}
                            <dt className="font-mono text-micro uppercase text-debu-ink">
                              Ended
                            </dt>
                            <dd className="font-mono tabular-nums text-dawat/75">
                              {p.ended ? (
                                <>
                                  {p.ended.type}
                                  {p.ended.year != null ? `, ${formatYear(p.ended.year)}` : ''}
                                </>
                              ) : (
                                <span className="font-latin italic text-debu-ink">
                                  No cited figure
                                </span>
                              )}
                            </dd>
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
                            {/* No population row. It has never carried a value
                                on any record, and the sentence under the page
                                head says so once — see the note by
                                `withPopulation`. When one is entered, put the
                                row back. */}
                          </dl>
                        </Link>
                      </li>
                    )
                  })}
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
            </div>
          ))}

          <p className="mt-20 border-t border-kashi/15 pt-6 font-mono text-micro uppercase text-debu-ink">
            {narrative.length} polities read · {regionCount} regions
          </p>
        </Shell>
      </main>
    </Page>
  )
}
