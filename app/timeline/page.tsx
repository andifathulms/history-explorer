import type { Metadata } from 'next'
import { formatSpan, formatYear } from '@/lib/years'
import { tickInterval } from '@/lib/thread'
import Link from 'next/link'
import { loadCorpus } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'
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
  const rows = [...narrative, ...context].sort(
    (a, b) => a.span.start.min - b.span.start.min,
  )
  const corpus = loadCorpus()

  const first = Math.min(...rows.map((p) => p.span.start.min))
  const last = Math.max(...rows.map((p) => p.span.end.max))

  // Counted, not asserted. The lede used to say "six of these eight", which was
  // true when the corpus had eight polities and has been wrong for fifty-eight
  // of them since. Deriving it means the sentence cannot go stale again.
  const concurrent = rows.filter((p) =>
    rows.some(
      (q) =>
        q.id !== p.id &&
        p.span.start.min <= q.span.end.max &&
        q.span.start.min <= p.span.end.max,
    ),
  ).length

  const W = 900
  const LABEL = 150
  // Two lines of label per row and no more. At 62 this chart ran to 4,150
  // units — five screens of mostly gap, with the year axis only at the top.
  const ROW = 46
  const H = rows.length * ROW + 56
  // A four-thousand-unit chart needs its axis more than once. The scale repeats
  // every band so a reader who has scrolled past the header still knows what
  // year a bar sits at.
  const BAND = 14
  const x = (year: number) => LABEL + ((year - first) / (last - first)) * (W - LABEL - 24)

  // Labels like "2300 BC" need width, and the corpus now spans four millennia.
  const step = tickInterval(last - first, 12)
  const centuries: number[] = []
  // No year zero: a tick labelled 0 marks a date that never happened.
  for (let y = Math.ceil(first / step) * step; y <= last; y += step) if (y !== 0) centuries.push(y)

  return (
    <Page ground="paper" current="Timeline">
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <PageHead kicker="Concurrency, not sequence" title="Timeline" ground="paper">
            <p>
              Overlap is the point: {concurrent} of these {rows.length} ran concurrently
              with at least one other, which is the thing a list of dynasties by region
              cannot show you. Rows are sorted by cited start date, so a neighbour on this
              axis is a contemporary. A soft bar end means the sources disagree about when
              it started or stopped.
            </p>
          </PageHead>

        {/* Above the chart, not below it. A key at the foot of four thousand
            pixels is a key you cannot see while you are reading the marks. */}
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-kashi/15 pt-5 font-mono text-micro uppercase text-debu-ink">
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

        <div className="-mx-5 mt-8 overflow-x-auto px-5 sm:-mx-8 sm:px-8">
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            height={H}
            className="min-w-[880px]"
            role="img"
            aria-label={`Timeline of ${rows.length} polities from ${first} to ${last}`}
          >
            {centuries.map((year) => (
              <line
                key={`grid-${year}`}
                x1={x(year)}
                x2={x(year)}
                y1={28}
                y2={H - 12}
                className="stroke-kashi/15"
                strokeWidth={1}
              />
            ))}

            {/* The scale, repeated every band. A chart this tall labelled only
                at its head asks the reader to hold the axis in their memory for
                three thousand pixels. */}
            {Array.from({ length: Math.ceil(rows.length / BAND) }).map((_, band) => {
              const y = band === 0 ? 18 : 44 + band * BAND * ROW - 20
              return (
                <g key={`axis-${band}`}>
                  {band > 0 ? (
                    <line
                      /* Starts at the plot edge: run to x=0 and it underlines
                         the polity name in the row above. */
                      x1={LABEL - 12}
                      x2={W}
                      y1={y + 7}
                      y2={y + 7}
                      className="stroke-kashi/20"
                      strokeWidth={1}
                    />
                  ) : null}
                  {centuries.map((year) => (
                    <text
                      key={year}
                      x={x(year)}
                      y={y}
                      className="fill-debu-ink font-mono text-[11px] tabular-nums"
                      textAnchor="middle"
                    >
                      {formatYear(year)}
                    </text>
                  ))}
                </g>
              )
            })}

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
                  {p.context_only ? (
                    /* Backdrop for the era, but no chapters and so no page. */
                    <text x={0} y={y + 5} className="fill-kashi/55 text-[14px]">
                      {p.name.latin}
                    </text>
                  ) : (
                    <Link href={`/polity/${p.id}/`}>
                      <text
                        x={0}
                        y={y + 5}
                        className="fill-kashi-deep text-[14px] font-semibold hover:fill-firuze-ink"
                      >
                        {p.name.latin}
                      </text>
                    </Link>
                  )}
                  <text x={0} y={y + 18} className="fill-debu-ink font-mono text-[10px] tabular-nums">
                    {formatSpan(p.span.start.min, p.span.end.max)}
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


        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
            Why some rows have no peak
          </h2>
          <p className="mt-4 text-body">
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
        </Shell>
      </main>
    </Page>
  )
}
