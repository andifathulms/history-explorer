import type { Metadata } from 'next'
import { formatRange } from '@/lib/years'
import { notFound } from 'next/navigation'
import {
  loadCorpus,
  getPolity,
  getChapters,
  getNeighbours,
  politiesInRegion,
  inThread,
  getRegion,
} from '@/lib/content'
import { buildField, rate, DEFAULT_WEIGHTS } from '@/lib/ratings'
import { formatKm2, formatPopulation, NO_FIGURE } from '@/lib/gaps'
import { Page, Shell, Crumbs, StatRow } from '@/components/Shell'
import { PolityRail } from '@/components/PolityRail'
import { Position } from '@/components/Position'
import { Chapters } from '@/components/Chapters'
import { Facts } from '@/components/Facts'
import { RatingPanel } from '@/components/RatingPanel'
import { PolityMap } from '@/components/PolityMap'
import { ExtentTrajectory } from '@/components/ExtentTrajectory'
import { TurningPoints } from '@/components/TurningPoints'
import { Institutions } from '@/components/Institutions'

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
    { label: 'Ended by', value: p.ended ? p.ended.type : NO_FIGURE, gap: !p.ended },
  ]

  return (
    // Paper ground: this is a reading view, and the change of ground says so
    // without a label.
    <Page ground="paper" current="Polities">
      {railPolities.length ? (
        <PolityRail polities={railPolities} active={p} variant="strip" />
      ) : null}

      <Shell className="flex-1 pb-28">
        <Crumbs
          ground="paper"
          trail={[
            { href: '/polities/', label: 'Polities' },
            ...(region ? [{ label: region.name }] : []),
            { label: p.name.latin },
          ]}
        />

        <div className="flex gap-12">
          {railPolities.length ? (
            <aside
              className="hidden shrink-0 pt-10 lg:block lg:w-[224px]"
              aria-label="Thread position"
            >
              <PolityRail polities={railPolities} active={p} variant="rail" />
            </aside>
          ) : null}

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
                {region ? <span>{region.name}</span> : null}
              </p>

              <p className="mt-6 max-w-measure text-lede text-dawat/85">{p.identity}</p>

              <StatRow ground="paper" stats={headline} />
            </header>

            <Position predecessors={predecessors} successors={successors} />

            <Chapters chapters={chapters} />

            <Facts polity={p} />

            <Institutions polity={p} />

            <TurningPoints polity={p} />

            <ExtentTrajectory polity={p} />

            <PolityMap polity={p} />

            <RatingPanel rating={rating} scale="absolute" />
          </main>
        </div>
      </Shell>
    </Page>
  )
}
