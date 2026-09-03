import type { Polity } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { tickInterval } from '@/lib/thread'

/**
 * The whole corpus as one figure: every polity a hairline, length the cited
 * span, position the cited date.
 *
 * This is the site's grammar drawn once at the front door — length is always a
 * quantity somebody printed. It is deliberately not a hero illustration: there
 * is no artwork here that a reader could mistake for an argument, only the same
 * bars the timeline and the rankings use, at the density that shows how much
 * of history the corpus is and is not.
 *
 * The faint outer bar is the contested extent and the solid inner one is the
 * agreed extent, exactly as on the timeline. A wide fade at both ends of a row
 * means the sources disagree about when it started or stopped, and nothing has
 * been split down the middle to tidy that up.
 */
export function CorpusSpans({ polities }: { polities: Polity[] }) {
  const rows = [...polities].sort((a, b) => a.span.start.min - b.span.start.min)
  const first = Math.min(...rows.map((p) => p.span.start.min))
  const last = Math.max(...rows.map((p) => p.span.end.max))

  const W = 1000
  const ROW = 7
  const TOP = 26
  const H = TOP + rows.length * ROW + 8
  const x = (year: number) => ((year - first) / (last - first)) * W

  const step = tickInterval(last - first, 8)
  const ticks: number[] = []
  for (let y = Math.ceil(first / step) * step; y <= last; y += step) if (y !== 0) ticks.push(y)

  return (
    <figure className="mt-14">
      {/* On a phone the axis labels would shrink below legibility if the whole
          four millennia were squeezed into 350px, so the figure keeps a floor
          width and scrolls instead. */}
      <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[620px]"
        role="img"
        aria-label={`Every polity on the site drawn as a span, ${formatYear(first)} to ${formatYear(
          last,
        )}. ${rows.length} rows.`}
      >
        {ticks.map((year) => (
          <g key={year}>
            <line
              x1={x(year)}
              x2={x(year)}
              y1={TOP - 12}
              y2={H}
              className="stroke-kaghaz/10"
              strokeWidth={1}
            />
            <text
              x={x(year)}
              y={TOP - 18}
              className="fill-debu-paper font-mono text-[11px] tabular-nums"
              textAnchor="middle"
            >
              {formatYear(year)}
            </text>
          </g>
        ))}

        {rows.map((p, i) => {
          const y = TOP + i * ROW
          const a = x(p.span.start.min)
          const b = x(p.span.end.max)
          const ca = x(p.span.start.max)
          const cb = x(p.span.end.min)
          return (
            <g key={p.id}>
              <rect
                x={a}
                y={y}
                width={Math.max(1, b - a)}
                height={3}
                rx={1.5}
                className="fill-kashi-soft/25"
              />
              <rect
                x={ca}
                y={y}
                width={Math.max(1, cb - ca)}
                height={3}
                rx={1.5}
                className={p.context_only ? 'fill-kashi-soft/60' : 'fill-firuze/85'}
              >
                <title>
                  {p.name.latin} — {formatYear(p.span.start.min)} to{' '}
                  {formatYear(p.span.end.max)}
                </title>
              </rect>
            </g>
          )
        })}
      </svg>
      </div>
      <figcaption className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-micro uppercase text-debu-paper">
        <span className="flex items-center gap-2">
          <span className="inline-block h-[3px] w-6 rounded-full bg-firuze/85" /> agreed extent
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[3px] w-6 rounded-full bg-kashi-soft/25" /> contested
          extent
        </span>
        <span>{rows.length} polities · one axis · no row scaled to fit</span>
      </figcaption>
    </figure>
  )
}
