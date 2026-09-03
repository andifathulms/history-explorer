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
} from '@/lib/content'
import { buildField, rate, DEFAULT_WEIGHTS } from '@/lib/ratings'
import { SiteNav } from '@/components/SiteNav'
import { PolityRail } from '@/components/PolityRail'
import { Position } from '@/components/Position'
import { Chapters } from '@/components/Chapters'
import { Facts } from '@/components/Facts'
import { RatingPanel } from '@/components/RatingPanel'
import { PolityMap } from '@/components/PolityMap'

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
  const startLabel =
    formatRange(span.start.min, span.start.max)
  const endLabel =
    formatRange(span.end.min, span.end.max)

  return (
    // Paper ground: this is a reading view, and the change of ground says so
    // without a label.
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="Polities" />
      {railPolities.length ? (
        <PolityRail polities={railPolities} active={p} variant="strip" />
      ) : null}

      <div className="mx-auto flex max-w-[1180px] gap-10 px-5 pb-28 pt-8 sm:px-8">
        {railPolities.length ? (
          <aside className="hidden lg:block lg:w-[200px] lg:shrink-0" aria-label="Thread position">
            <PolityRail polities={railPolities} active={p} variant="rail" />
          </aside>
        ) : null}

        <main id="main" className="min-w-0 flex-1">
          <header>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h1 className="text-[34px] leading-tight text-kashi">{p.name.latin}</h1>
              {p.name.script ? (
                <p
                  lang={p.name.script_lang ?? 'fa'}
                  className="text-[30px] leading-tight text-kashi"
                >
                  {p.name.script}
                </p>
              ) : null}
            </div>
            <p className="mt-1 tabular-nums text-debu-ink">
              {startLabel} – {endLabel}
            </p>
            <p className="mt-4 max-w-measure text-body">{p.identity}</p>
          </header>

          <Position predecessors={predecessors} successors={successors} />

          <Chapters chapters={chapters} />

          <Facts polity={p} />

          <PolityMap polity={p} />

          <RatingPanel rating={rating} scale="absolute" />
        </main>
      </div>
    </div>
  )
}
