import type { Metadata } from 'next'
import Link from 'next/link'
import { formatRange } from '@/lib/years'
import { notFound } from 'next/navigation'
import {
  loadCorpus,
  getPolity,
  getChapters,
  getNeighbours,
  getTransfers,
  getResumption,
  politiesInRegion,
  inThread,
  getRegion,
} from '@/lib/content'
import { buildField, rate, DEFAULT_WEIGHTS, ordinal } from '@/lib/ratings'
import { contemporariesOf } from '@/lib/contemporaries'
import { formatKm2, formatPopulation, NO_FIGURE } from '@/lib/gaps'
import { Page, Shell, Crumbs, StatRow } from '@/components/Shell'
import { PolityRail } from '@/components/PolityRail'
import { PolityFoot } from '@/components/PolityFoot'
import { PageNav, type NavSection } from '@/components/PageNav'
import { Position, Transfers } from '@/components/Position'
import { Chapters } from '@/components/Chapters'
import { Facts } from '@/components/Facts'
import { RatingPanel } from '@/components/RatingPanel'
import { PolityMap } from '@/components/PolityMap'
import { ExtentTrajectory } from '@/components/ExtentTrajectory'
import { TurningPoints } from '@/components/TurningPoints'
import { Institutions } from '@/components/Institutions'
import { Contemporaries } from '@/components/Contemporaries'

export function generateStaticParams() {
  return loadCorpus().narrative.map((p) => ({ id: p.id }))
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const p = getPolity(params.id)
  if (!p) return {}
  return { title: p.name.latin, description: p.identity }
}

export default function PolityPage({ params }: { params: { id: string } }) {
  const corpus = loadCorpus()
  const p = getPolity(params.id)
  if (!p || p.context_only) notFound()

  const chapters = getChapters(p.id)
  const { predecessors, successors } = getNeighbours(p.id)
  const { resumes, resumedBy } = getResumption(p.id)
  const { lost, gained } = getTransfers(p.id)
  const region = getRegion(p.region)

  // The rail is the continuity section's instrument, so it only appears for a
  // polity that actually stands in a thread — and it is scoped to that polity's
  // own region. Once a second region exists, a global rail would put the
  // Samanids on a line beside Srivijaya and imply a sequence nobody cited.
  const railPolities = inThread(p) ? politiesInRegion(p.region) : []

  // The polity page shows absolute figures with the site's default weights.
  // Reader weights live on the rankings view, where changing them is the
  // point; here they would be a second control competing with the prose.
  const field = buildField(corpus.narrative, corpus.backdrop, 'absolute', corpus.denominators)
  const rating = rate(p, field, DEFAULT_WEIGHTS, 'absolute', corpus.denominators)

  const { certain, possible } = contemporariesOf(p, corpus.all, corpus.backdrop)

  // What the gutter nav lists. Built from the same conditions the sections
  // themselves render under, so a nav entry can never point at a section that
  // decided not to draw itself — the two sections that come and go are the
  // extent series, which needs two cited figures before it is a trajectory,
  // and territory, which most polities never lost or took.
  // Either side of this polity on its own region's shelf, by start date, which
  // is the order /polities/ already browses in. Context-only records are
  // skipped because they have no page to send anybody to.
  const shelf = politiesInRegion(p.region).filter((x) => !x.context_only)
  const here = shelf.findIndex((x) => x.id === p.id)
  const previous = here > 0 ? shelf[here - 1] : undefined
  const next = here >= 0 && here < shelf.length - 1 ? shelf[here + 1] : undefined

  const sections: NavSection[] = [
    { id: 'facts-heading', label: 'Facts' },
    { id: 'institutions-heading', label: 'Governed' },
    { id: 'turning-heading', label: 'Turning points' },
    ...(p.measures.extent.length >= 2
      ? [{ id: 'extent-heading', label: 'Extent over time' }]
      : []),
    { id: 'chapters-heading', label: 'Chapters' },
    { id: 'position-heading', label: 'Succession' },
    ...(lost.length || gained.length
      ? [{ id: 'transfers-heading', label: 'Territory' }]
      : []),
    { id: 'contemporaries-heading', label: 'Contemporaries' },
    { id: 'map-heading', label: 'Map' },
    { id: 'rating', label: 'Rating' },
  ]

  const span = p.span
  const startLabel = formatRange(span.start.min, span.start.max)
  const endLabel = formatRange(span.end.min, span.end.max)
  const years = rating.longevity.years

  // The masthead figures are the four a reader asks first. They are the same
  // values the rating panel expands on, printed once at the top rather than
  // waiting at the foot of a long page — and a missing one says so here too.
  const headline = [
    {
      label: 'Reach',
      value: formatKm2(p.measures.reach_km2?.value ?? null),
      gap: p.measures.reach_km2?.value == null,
    },
    {
      label: 'Lasted',
      value:
        years.min === years.max ? `${years.min} yrs` : `${years.min}–${years.max} yrs`,
    },
    {
      label: 'Population',
      value: formatPopulation(p.measures.peak_population?.value ?? null),
      gap: p.measures.peak_population?.value == null,
    },
    // Was "Ended by", which printed a closed-vocabulary word in tabular mono
    // as though it were a figure, and now sits sixty pixels lower in Facts
    // with its year and its citation. The rating is the figure that was
    // missing: it is what this site computes and nowhere else publishes, and
    // it used to be collapsed at the very foot of the page.
    {
      label: 'Rating',
      value: rating.total.present
        ? `${ordinal(Math.round(rating.total.value * 100))} pct`
        : NO_FIGURE,
      gap: !rating.total.present,
    },
  ]

  return (
    // Paper ground: this is a reading view, and the change of ground says so
    // without a label.
    <Page ground="paper" current="Polities">
      <Shell className="flex-1 pb-28">
        <Crumbs
          ground="paper"
          trail={[
            { href: '/polities/', label: 'Polities' },
            // The region crumb links to its own section on /polities/, which
            // already carries `id={r.id}` and a scroll-margin for exactly this.
            // A region has no page of its own — browsing is one list — so this
            // is where the label means, and leaving it dead made the middle of
            // every breadcrumb on the site the only unclickable one.
            ...(region ? [{ href: `/polities/#${region.id}`, label: region.name }] : []),
            { label: p.name.latin },
          ]}
        />

        <div className="flex gap-12">
          {/* The gutter, on every polity rather than only the threaded ones.
              A layout that appears and disappears on a data property the
              reader cannot see is not a layout, and the column stood empty on
              most pages while the page it flanked had no way to move around
              except the scrollbar. */}
          <aside className="hidden shrink-0 pt-10 lg:block lg:w-[224px]">
            {/* The rail can run past the viewport on a crowded region, so the
                whole gutter scrolls inside itself rather than clipping. */}
            <div className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto pb-6">
              <PageNav sections={sections} />
              {railPolities.length ? (
                <div className="mt-10 border-t border-kashi/15 pt-6">
                  <p className="kicker pb-3 text-debu-ink">In this thread</p>
                  <PolityRail polities={railPolities} active={p} variant="rail" />
                </div>
              ) : null}
            </div>
          </aside>

          <main id="main" className="min-w-0 flex-1">
            <header className="pt-6">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <h1 className="font-display text-display font-semibold text-kashi-deep">
                  {p.name.latin}
                </h1>
                {p.name.script ? (
                  <p
                    lang={p.name.script_lang ?? 'fa'}
                    className="text-[30px] leading-tight text-kashi"
                  >
                    {p.name.script}
                  </p>
                ) : null}
              </div>

              {/* Both endpoints are ranges where the sources disagree, so they
                  are labelled rather than run together: "819–892 – 999–1005"
                  reads as four dates in a row and says nothing. */}
              <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[13px] uppercase tracking-[0.08em] text-debu-ink">
                <span>
                  Began <span className="tabular-nums text-kashi">{startLabel}</span>
                </span>
                <span>
                  Ended <span className="tabular-nums text-kashi">{endLabel}</span>
                </span>
                {region ? (
                  <Link
                    href={`/polities/#${region.id}`}
                    className="transition-colors hover:text-firuze-ink"
                  >
                    {region.name}
                  </Link>
                ) : null}
              </p>

              <p className="mt-6 max-w-measure text-lede text-dawat/85">{p.identity}</p>

              <StatRow ground="paper" stats={headline} />
            </header>

            {/* Mobile has no gutter to put furniture in, so both instruments
                sit here instead — below the name and the figures rather than
                above the breadcrumb, where an unlabelled bar used to be the
                first thing a phone reader met. */}
            <div className="mt-10 lg:hidden">
              <details className="border-y border-kashi/15 py-3">
                <summary className="cursor-pointer font-mono text-micro uppercase tracking-[0.08em] text-firuze-ink">
                  On this page &mdash; {sections.length} sections
                </summary>
                <ul className="mt-3 grid grid-cols-2 gap-x-6">
                  {sections.map((sec) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="block border-b border-kashi/10 py-2.5 font-mono text-[12px] uppercase tracking-[0.05em] text-kashi"
                      >
                        {sec.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>

              {railPolities.length ? (
                <div className="mt-8">
                  <PolityRail polities={railPolities} active={p} variant="strip" />
                </div>
              ) : null}
            </div>

            {/* Order, and the reasoning for it.

                The reference sections come first because most arrivals are
                looking something up, not settling in: who founded it, where it
                was, what ended it. Those are a fifteen-row list and a handful
                of dated hinges, so they cost a reader who came to read one
                screen — while the old order cost a reader who came to look up
                the whole essay. On the Abbasid page every one of these sat past
                a five-thousand-nine-hundred-word scroll.

                Turning points and the extent series sit above the chapters
                rather than below them because both are chronological: they
                frame the read instead of interrupting it.

                Succession moved below the chapters. It is a claim about this
                polity's relations, and it means more once you know the polity
                than before you do — and on an edgeless polity it opened the
                page on a paragraph about what is not recorded, which is the
                weakest possible first line under an identity sentence. */}
            <Facts polity={p} />

            <Institutions polity={p} />

            <TurningPoints polity={p} />

            <ExtentTrajectory polity={p} />

            <Chapters chapters={chapters} />

            <Position
              polity={p}
              predecessors={predecessors}
              successors={successors}
              resumes={resumes}
              resumedBy={resumedBy}
            />

            <Transfers lost={lost} gained={gained} />

            <Contemporaries certain={certain} possible={possible} />

            <PolityMap polity={p} />

            <RatingPanel
              rating={rating}
              scale="absolute"
              fieldSize={corpus.all.length}
              backdropSize={corpus.backdrop.length}
            />

            <PolityFoot previous={previous} next={next} region={region} />
          </main>
        </div>
      </Shell>
    </Page>
  )
}
