import Link from 'next/link'
import type { Polity } from '@/lib/types'
import { formatSpan, formatYear } from '@/lib/years'

/**
 * A region's polities on one axis, one lane each.
 *
 * The cards below say what each polity was; this says when, relative to its
 * neighbours, which is the question a list of spans in mono makes a reader
 * answer in their head. The Saffarids and the Samanids ran together and
 * hostile, and here that is a picture rather than arithmetic.
 *
 * It is not a thread. A thread draws sourced succession; these lanes draw only
 * spans, overlap is not a relation, and a region with no thread gets its lanes
 * like any other. Pale ends are ranges the sources give for an endpoint.
 *
 * Each lane is a link to the polity and names it, so the figure is a way in
 * rather than a picture of one. Hovering a lane lights its card and the other
 * way round; that wiring lives in PolityBrowser.
 */
export function RegionLanes({ polities }: { polities: Polity[] }) {
  if (polities.length < 2) return null
  const lo = Math.min(...polities.map((p) => p.span.start.min))
  const hi = Math.max(...polities.map((p) => p.span.end.max))
  const ticks = niceTicks(lo, hi)
  const a0 = Math.min(lo, ticks[0])
  const a1 = Math.max(hi, ticks[ticks.length - 1])
  const pct = (y: number) => ((y - a0) / (a1 - a0)) * 100
  const ranged = polities.some(
    (p) => p.span.start.min !== p.span.start.max || p.span.end.min !== p.span.end.max,
  )

  return (
    <figure className="mt-5 border-t border-kashi/12 pt-4">
      <figcaption className="sr-only">
        Spans of the {polities.length} polities in this region on one axis, {formatYear(a0)} to{' '}
        {formatYear(a1)}.
      </figcaption>
      <ul className="relative">
        {polities.map((p) => {
          const { start, end } = p.span
          const core = start.max < end.min
          return (
            <li key={p.id}>
              <Link href={`/polity/${p.id}/`} data-lane={p.id} className="lane">
                <span className="lane-name">
                  {p.name.latin}
                  <span className="sr-only">, {formatSpan(start.min, end.max)}</span>
                </span>
                <span className="lane-track" aria-hidden="true">
                  <span
                    className={`lane-bar ${core ? 'lane-bar-soft' : ''}`}
                    style={{ left: `${pct(start.min)}%`, width: `${pct(end.max) - pct(start.min)}%` }}
                  />
                  {core ? (
                    <span
                      className="lane-bar"
                      style={{ left: `${pct(start.max)}%`, width: `${pct(end.min) - pct(start.max)}%` }}
                    />
                  ) : null}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {/* The axis sits under the lanes' track column, not under the names. */}
      <div aria-hidden="true" className="lane mt-1 py-0 hover:bg-transparent">
        <span />
        <span className="relative h-4">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute top-0 -translate-x-1/2 font-mono text-[10.5px] tabular-nums text-debu-ink"
              style={{ left: `${pct(t)}%` }}
            >
              {/* There is no year zero; a tick there marks the turn of the era. */}
              {t === 0 ? 'AD 1' : formatYear(t)}
            </span>
          ))}
        </span>
      </div>
      {ranged ? (
        <p className="mt-2 font-sans text-[12px] text-debu-ink">
          Pale ends are dates the sources give as a range.
        </p>
      ) : null}
    </figure>
  )
}

/** Round years for an axis: at most six labels, on a step a reader would pick. */
function niceTicks(lo: number, hi: number): number[] {
  const steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000]
  const step = steps.find((s) => (hi - lo) / s <= 5) ?? 1000
  const first = Math.ceil(lo / step) * step
  const out: number[] = []
  for (let y = first; y <= hi; y += step) out.push(y)
  return out.length ? out : [lo, hi]
}
