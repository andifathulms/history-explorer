import type { Metadata } from 'next'
import Link from 'next/link'
import { loadCorpus } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { PHASES } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'The eight polities as overlapping spans, with chapters aligned by phase.',
}

/**
 * PRD section 8: the eight polities as overlapping spans, chapters aligned by
 * phase tag where present.
 *
 * Horizontal here rather than vertical, because the question this view answers
 * is "who was running at the same time as whom", and rows sharing a time axis
 * answer it at a glance. The thread stays vertical everywhere else.
 *
 * Chapters without a phase tag are drawn as unlabelled marks on the row rather
 * than omitted. A polity whose chapters mostly do not fit the template should
 * look like one — that is a fact about the polity, not a hole in the data.
 */
export default function TimelineView() {
  const { narrative, context } = loadCorpus()
  const rows = [...narrative, ...context.filter((p) => p.id !== 'abbasid')].sort(
    (a, b) => a.span.start.min - b.span.start.min,
  )
  const corpus = loadCorpus()

  const first = Math.min(...rows.map((p) => p.span.start.min))
  const last = Math.max(...rows.map((p) => p.span.end.max))
  const W = 900
  const LABEL = 150
  const ROW = 62
  const H = rows.length * ROW + 56
  const x = (year: number) => LABEL + ((year - first) / (last - first)) * (W - LABEL - 24)

  const centuries: number[] = []
  for (let y = Math.ceil(first / 100) * 100; y <= last; y += 100) centuries.push(y)

  return (
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="Timeline" />
      <main id="main" className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">Timeline</h1>
        <p className="mt-3 max-w-measure text-body">
          Overlap is the point. Six of these eight ran concurrently with at least one
          other, and several of them were hostile to the polity drawn directly above or
          below. A soft bar end means the sources disagree about when it started or
          stopped.
        </p>

        <div className="mt-8 overflow-x-auto">
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            height={H}
            className="min-w-[880px]"
            role="img"
            aria-label={`Timeline of ${rows.length} polities from ${first} to ${last}`}
          >
            {centuries.map((year) => (
              <g key={year}>
                <line
                  x1={x(year)}
                  x2={x(year)}
                  y1={28}
                  y2={H - 12}
                  className="stroke-kashi/15"
                  strokeWidth={1}
                />
                <text x={x(year)} y={18} className="fill-debu-ink text-[12px] tabular-nums" textAnchor="middle">
                  {year}
                </text>
              </g>
            ))}

            {rows.map((p, i) => {
              const y = 44 + i * ROW
              const chapters = corpus.chapters.get(p.id) ?? []
              // Chapters have no dates of their own, so they are distributed
              // evenly across the certain span. This is a reading aid for where
              // a phase sits in the arc, not a claim about when it happened.
              const cx = (idx: number) => {
                const a = x(p.span.start.max)
                const b = x(p.span.end.min)
                return a + ((idx + 0.5) / Math.max(1, chapters.length)) * (b - a)
              }

              return (
                <g key={p.id}>
                  <Link href={`/polity/${p.id}/`}>
                    <text x={0} y={y + 5} className="fill-kashi text-[14px] hover:fill-firuze-ink">
                      {p.name.latin}
                    </text>
                  </Link>
                  <text x={0} y={y + 20} className="fill-debu-ink text-[11px] tabular-nums">
                    {p.span.start.min}–{p.span.end.max}
                  </text>

                  {/* Uncertain extent. */}
                  <rect
                    x={x(p.span.start.min)}
                    y={y - 5}
                    width={Math.max(2, x(p.span.end.max) - x(p.span.start.min))}
                    height={10}
                    rx={5}
                    className="fill-kashi/15"
                  />
                  {/* Certain extent. */}
                  <rect
                    x={x(p.span.start.max)}
                    y={y - 5}
                    width={Math.max(2, x(p.span.end.min) - x(p.span.start.max))}
                    height={10}
                    rx={5}
                    className={p.context_only ? 'fill-debu-ink/50' : 'fill-kashi/70'}
                  />

                  {chapters.map((c, idx) => (
                    <g key={c.slug}>
                      <circle
                        cx={cx(idx)}
                        cy={y}
                        r={c.phase === 'peak' ? 5 : 3.5}
                        className={
                          c.phase === 'peak'
                            ? 'fill-zarrin-ink'
                            : c.phase
                              ? 'fill-firuze-ink'
                              : 'fill-debu-ink'
                        }
                      >
                        <title>
                          {c.title}
                          {c.phase ? ` — ${c.phase}` : ' — no phase tag'}
                        </title>
                      </circle>
                    </g>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-debu-ink">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-zarrin-ink" /> peak chapter
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-firuze-ink" /> other tagged phase
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-debu-ink" /> untagged chapter
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-6 rounded-full bg-kashi/15" /> contested span
          </span>
        </div>

        <section className="mt-12 max-w-measure">
          <h2 className="text-[20px] text-kashi">Why some rows have no peak</h2>
          <p className="mt-3 text-body">
            The phase vocabulary — {PHASES.join(', ')} — is optional, and the rows that do
            not use all of it are the reason. The Ghurids barely had a golden age before
            Khwarazm ended them, and the Tahirids never expanded: they were granted a
            province and kept it. Forcing every polity through the same five acts would
            mean writing something untrue about at least two of them, so the tag is left
            off and the row shows the absence.
          </p>
          <p className="mt-4 text-body">
            Chapter marks are spaced evenly along a polity&rsquo;s certain span. Chapters
            do not carry dates of their own, and inventing one to position a dot would be
            the same class of error as inventing a figure. The marks say where a phase
            sits in the arc, not when it happened.
          </p>
        </section>
      </main>
    </div>
  )
}
