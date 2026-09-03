import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadCorpus, getPolity, getChapters, getNeighbours } from '@/lib/content'
import { buildField, rate, DEFAULT_WEIGHTS } from '@/lib/ratings'
import { SiteNav } from '@/components/SiteNav'
import { PolityRail } from '@/components/PolityRail'
import { Position } from '@/components/Position'
import { Chapters } from '@/components/Chapters'
import { Facts } from '@/components/Facts'
import { RatingPanel } from '@/components/RatingPanel'

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

  // The polity page shows absolute figures with the site's default weights.
  // Reader weights live on the comparison view, where changing them is the
  // point; here they would be a second control competing with the prose.
  const field = buildField(corpus.narrative, corpus.backdrop, 'absolute', corpus.denominators)
  const rating = rate(p, field, DEFAULT_WEIGHTS, 'absolute', corpus.denominators)

  const span = p.span
  const startLabel =
    span.start.min === span.start.max ? `${span.start.min}` : `${span.start.min}–${span.start.max}`
  const endLabel =
    span.end.min === span.end.max ? `${span.end.min}` : `${span.end.min}–${span.end.max}`

  return (
    // Paper ground: this is a reading view, and the change of ground says so
    // without a label.
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" />
      <PolityRail polities={corpus.all} active={p} variant="strip" />

      <div className="mx-auto flex max-w-[1180px] gap-10 px-5 pb-28 pt-8 sm:px-8">
        <aside className="hidden lg:block lg:w-[200px] lg:shrink-0" aria-label="Thread position">
          <PolityRail polities={corpus.all} active={p} variant="rail" />
        </aside>

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
            <p className="mt-1 tabular-nums text-debu">
              {startLabel} – {endLabel}
            </p>
            <p className="mt-4 max-w-measure text-body">{p.identity}</p>
          </header>

          <Position predecessors={predecessors} successors={successors} selfId={p.id} />

          <Chapters chapters={chapters} />

          <Facts polity={p} />

          <RatingPanel rating={rating} scale="absolute" />
        </main>
      </div>
    </div>
  )
}
