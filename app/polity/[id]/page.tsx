import type { Metadata } from 'next'
import Link from 'next/link'
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
import { scriptLang } from '@/lib/scripts'
import { buildField, rate, DEFAULT_WEIGHTS, ordinal } from '@/lib/ratings'
import { contemporariesOf } from '@/lib/contemporaries'
import { formatKm2, formatPopulation, NO_FIGURE } from '@/lib/gaps'
import { citeShort } from '@/lib/content'
import { Page, Shell } from '@/components/Shell'
import { PolityRail } from '@/components/PolityRail'
import { PolityFoot } from '@/components/PolityFoot'
import { PolityHero, type HeroFigure } from '@/components/PolityHero'
import { SectionTabs } from '@/components/SectionTabs'
import type { NavSection } from '@/components/PageNav'
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

  // Either side of this polity on its own region's shelf, by start date, which
  // is the order /polities/ already browses in. Context-only records are
  // skipped because they have no page to send anybody to.
  const shelf = politiesInRegion(p.region).filter((x) => !x.context_only)
  const here = shelf.findIndex((x) => x.id === p.id)
  const previous = here > 0 ? shelf[here - 1] : undefined
  const next = here >= 0 && here < shelf.length - 1 ? shelf[here + 1] : undefined

  // What the section tabs list. Built from the same conditions the sections
  // themselves render under, so a tab can never point at a section that
  // decided not to draw itself — the two sections that come and go are the
  // extent series, which needs two cited figures before it is a trajectory,
  // and territory, which most polities never lost or took.
  //
  // Every named neighbour, recorded or external, is the Succession tab's count.
  const succession =
    predecessors.length +
    successors.length +
    (p.preceded_by_external?.length ?? 0) +
    (p.succeeded_by_external?.length ?? 0)
  const sections: (NavSection & { count?: number })[] = [
    { id: 'facts-heading', label: 'Overview' },
    { id: 'institutions-heading', label: 'Institutions' },
    {
      id: 'turning-heading',
      label: 'Turning points',
      ...(p.turning_points.length ? { count: p.turning_points.length } : {}),
    },
    ...(p.measures.extent.length >= 2
      ? [{ id: 'extent-heading', label: 'Extent over time' }]
      : []),
    { id: 'chapters-heading', label: 'Chapters', count: chapters.length },
    { id: 'position-heading', label: 'Succession', ...(succession ? { count: succession } : {}) },
    ...(lost.length || gained.length
      ? [{ id: 'transfers-heading', label: 'Territory' }]
      : []),
    ...(certain.length || possible.length
      ? [
          {
            id: 'contemporaries-heading',
            label: 'Contemporaries',
            count: certain.length + possible.length,
          },
        ]
      : []),
    { id: 'map-heading', label: 'Map' },
    { id: 'rating', label: 'Rating' },
  ]

  const years = rating.longevity.years
  const reach = p.measures.reach_km2

  // The four a reader asks first. They are the same values the rating panel
  // expands on, printed at the top rather than waiting at the foot of a long
  // page — and a missing one says so here too.
  const figures: HeroFigure[] = [
    {
      label: 'Reach at peak',
      value: formatKm2(reach?.value ?? null),
      gap: reach?.value == null,
      note: reach?.value != null ? `${reach.at} · ${citeShort(reach.source)}` : undefined,
    },
    {
      label: 'Lasted',
      value:
        years.min === years.max ? `${years.min} yrs` : `${years.min}–${years.max} yrs`,
      note: years.min === years.max ? undefined : 'The sources date its ends as ranges.',
    },
    {
      label: 'Peak population',
      value: formatPopulation(p.measures.peak_population?.value ?? null),
      gap: p.measures.peak_population?.value == null,
    },
    // The one figure this site computes rather than cites. The bar is its
    // length because it is a share — a percentile — and the note says what it
    // was computed from, as the rating panel always does.
    {
      label: 'Rating',
      value: rating.total.present
        ? `${ordinal(Math.round(rating.total.value * 100))} pct`
        : NO_FIGURE,
      gap: !rating.total.present,
      bar: rating.total.present ? rating.total.value : undefined,
      note: (
        <>
          {rating.totalProvenance} ·{' '}
          <a href="#rating" className="text-firuze-bright hover:text-kaghaz">
            how
          </a>
        </>
      ),
    },
  ]

  return (
    // Paper ground: this is a reading view, and the change of ground says so
    // without a label. The hero above it is dark because it is where a reader
    // orients, and the nav goes dark with it.
    <Page ground="paper" nav="dark" current="Polities">
      <PolityHero
        polity={p}
        region={region}
        threadSize={railPolities.length}
        chapters={chapters}
        figures={figures}
      />

      <SectionTabs
        sections={sections}
        next={next ? { href: `/polity/${next.id}/`, label: next.name.latin } : undefined}
      />

      <Shell className="flex-1 pb-28">
        <div className="flex gap-12">
          {/* The gutter is the thread's, and only a threaded polity has one.
              The section list that used to stand in it on every page is the
              tab bar above now; a polity with no thread takes the full
              measure, as DESIGN.md always said it should. */}
          {railPolities.length ? (
            <aside className="hidden shrink-0 pt-12 lg:block lg:w-[224px]">
              {/* The rail can run past the viewport on a crowded region, so
                  the column scrolls inside itself rather than clipping. */}
              <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pb-6">
                <p className="label pb-3 text-debu-ink">In this thread</p>
                <PolityRail polities={railPolities} active={p} variant="rail" />
              </div>
            </aside>
          ) : null}

          <main id="main" className="min-w-0 flex-1 pt-4">
            {railPolities.length ? (
              <div className="mt-8 lg:hidden">
                <PolityRail polities={railPolities} active={p} variant="strip" />
              </div>
            ) : null}

            {/* Order, and the reasoning for it.

                The reference sections come first because most arrivals are
                looking something up, not settling in: who founded it, where it
                was, what ended it. The tab bar makes the chapters one tap away
                from the top, so a reader who came to read is no longer charged
                for the reader who came to look something up.

                Turning points and the extent series sit above the chapters
                rather than below them because both are chronological: they
                frame the read instead of interrupting it.

                Succession sits below the chapters. It is a claim about this
                polity's relations, and it means more once you know the polity
                than before you do. */}
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
