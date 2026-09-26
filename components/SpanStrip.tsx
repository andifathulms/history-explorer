import type { Span } from '@/lib/types'
import { formatRange } from '@/lib/years'

/**
 * A span drawn to scale on a fixed axis.
 *
 * Length is the cited span and nothing else. Where an endpoint is a range —
 * the Samanids began somewhere in 819–892 — the range is drawn pale and the
 * stretch both readings agree on is drawn solid, the same way the rankings draw
 * a contested longevity. Nothing is averaged to find a single start.
 *
 * On the index every card shares one axis, the corpus's full extent, so a
 * strip says where in history a polity sat as well as how long it lasted. That
 * matters most in search results, where the region's own lanes are gone and a
 * reader is looking at the Kushans beside the Karakhanids.
 */
export function SpanStrip({
  span,
  axis,
  ticks = [],
  className = '',
}: {
  span: Span
  axis: [number, number]
  ticks?: number[]
  className?: string
}) {
  const [a0, a1] = axis
  const pct = (y: number) => ((y - a0) / (a1 - a0)) * 100
  const { start, end } = span
  // The agreed core runs from the latest possible start to the earliest
  // possible end. On a very short, very uncertain span those can cross, and
  // then there is no stretch both readings share — only the pale outer one.
  const core = start.max < end.min ? [start.max, end.min] : null

  return (
    <div
      className={`strip ${className}`}
      role="img"
      aria-label={`Began ${formatRange(start.min, start.max)}, ended ${formatRange(end.min, end.max)}`}
    >
      <span className="strip-track" />
      {ticks.map((t) => (
        <span key={t} className="strip-tick" style={{ left: `${pct(t)}%` }} />
      ))}
      <span
        className={`strip-bar ${core ? 'strip-bar-soft' : ''}`}
        style={{ left: `${pct(start.min)}%`, width: `${pct(end.max) - pct(start.min)}%` }}
      />
      {core ? (
        <span
          className="strip-bar"
          style={{ left: `${pct(core[0])}%`, width: `${pct(core[1]) - pct(core[0])}%` }}
        />
      ) : null}
    </div>
  )
}
