import type { Metadata } from 'next'
import { formatYear } from '@/lib/years'
import { tickInterval } from '@/lib/thread'
import { loadCorpus } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'
import { ConcurrencyProfile } from '@/components/ConcurrencyProfile'
import { TimelineChart, type TimelineRow } from '@/components/TimelineChart'
import { PHASES } from '@/lib/types'

// The description is what a search result quotes, so it is the one sentence
// about this page most people will ever read. It said "the eight polities"
// long after there were two hundred and twelve, because unlike the lede below
// it was never taught to count. It counts now.
export function generateMetadata(): Metadata {
  const { narrative, context } = loadCorpus()
  const n = narrative.length + context.length
  return {
    title: 'Timeline',
    description: `${n} polities as overlapping spans on one axis, with what is cited for each.`,
  }
}

/**
 * PRD section 8: the corpus as overlapping spans, chapters aligned by phase tag
 * where present.
 *
 * Horizontal here rather than vertical, because the question this view answers
 * is "who was running at the same time as whom", and rows sharing a time axis
 * answer it at a glance. The thread stays vertical everywhere else.
 *
 * The phase spine sits beside the name and not on the axis. A polity whose
 * chapters mostly do not fit the template should look like one — that is a
 * fact about the polity, not a hole in the data — but saying so on a year axis
 * would have put a date on it, and chapters carry no dates. See the note at the
 * top of TimelineChart.
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

  // Only what the chart reads. Whole polities would put every chapter body
  // into the client bundle for a view that draws none of them.
  const regionName = new Map(corpus.regions.map((r) => [r.id, r.name]))
  const chartRows: TimelineRow[] = rows.map((p) => ({
    id: p.id,
    name: p.name.latin,
    regionName: regionName.get(p.region) ?? p.region,
    startMin: p.span.start.min,
    startMax: p.span.start.max,
    endMin: p.span.end.min,
    endMax: p.span.end.max,
    hasPage: !p.context_only,
    phases: Array.from(
      new Set((corpus.chapters.get(p.id) ?? []).map((c) => c.phase).filter(Boolean)),
    ) as string[],
    // The `at` on a cited reach: a year a source put its own figure at. Sixty
    // records carry one, and they are the only dated marks the corpus has —
    // there is not a single turning point in it yet.
    peakYear: p.measures.reach_km2?.at ?? null,
  }))

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
              axis is a contemporary &mdash; and standing at a year says who else was
              there. A soft bar end means the sources disagree about when it started or
              stopped.
            </p>
          </PageHead>

        {/* The shape of the corpus before the chart of it. Twelve screens of
            Gantt say the same thing and say it twelve screens at a time. */}
        <ConcurrencyProfile
          spans={rows.map((p) => ({ start: p.span.start.min, end: p.span.end.max }))}
        />

        <TimelineChart rows={chartRows} first={first} last={last} ticks={centuries} />

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
            Why some rows have no peak
          </h2>
          <p className="mt-4 text-body">
            The phase vocabulary — {PHASES.join(', ')} — is optional, and the rows that do
            not use all of it are the reason. The Ghurids barely had a golden age before
            Khwarazm ended them, and the Tahirids never expanded: they were granted a
            province and kept it. Forcing every polity through the same {PHASES.length}{' '}
            acts would mean writing something untrue about at least two of them, so the
            tag is left off and the row shows the absence.
          </p>
          <p className="mt-4 text-body">
            The spine sits beside the name rather than on the chart. Chapters carry no
            dates of their own, and a mark placed at a horizontal position on an axis
            labelled in years is a date whether or not it was meant as one &mdash; the
            same class of error as inventing a figure, committed in pixels. The spine
            says which phases are written. It says nothing about when they were.
          </p>
          <p className="mt-4 text-body">
            One mark is on the axis, and it is cited: where a source dates its own extent
            figure to a year, that year is drawn. Sixty of these records carry one.
          </p>
        </section>
        </Shell>
      </main>
    </Page>
  )
}
