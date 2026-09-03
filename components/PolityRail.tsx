import Link from 'next/link'
import { formatYear } from '@/lib/years'
import type { Polity } from '@/lib/types'
import { hasPage } from '@/lib/content'

/**
 * The rail on a polity page. Same line as the landing view, compressed to fit a
 * sticky column, scrolled to nothing — the whole sequence is visible at once and
 * the current polity is marked, so you always know where in it you are standing.
 *
 * On mobile this collapses to a horizontal strip, which is the same information
 * rotated: 819 at one end, 1231 at the other, a marker where you are.
 */
export function PolityRail({
  polities,
  active,
  variant,
}: {
  polities: Polity[]
  active: Polity
  /** 'rail' is the desktop column, 'strip' the mobile bar. One page renders
   *  both, so the caller picks rather than the component rendering two DOMs. */
  variant: 'rail' | 'strip'
}) {
  const first = Math.min(...polities.map((p) => p.span.start.min))
  const last = Math.max(...polities.map((p) => p.span.end.max))
  const H = 560
  const PAD = 16
  const y = (year: number) => PAD + ((year - first) / (last - first)) * (H - PAD * 2)
  const pct = (year: number) => (((year - first) / (last - first)) * 100).toFixed(2)

  const ordered = [...polities].sort((a, b) => a.span.start.min - b.span.start.min)

  if (variant === 'strip') {
    // Mobile: the strip. Same axis, rotated, still tells you where you are.
    return (
      <div className="flex items-center gap-3 border-b border-kashi/20 px-5 py-3 text-[12px] tabular-nums text-debu-ink lg:hidden">
        <span>{formatYear(first)}</span>
        <span className="relative h-[3px] flex-1 rounded-full bg-kashi/25">
          <span
            className="absolute top-0 h-[3px] rounded-full bg-zarrin"
            style={{
              left: `${pct(active.span.start.max)}%`,
              width: `${Math.max(
                1.5,
                Number(pct(active.span.end.min)) - Number(pct(active.span.start.max)),
              )}%`,
            }}
          />
        </span>
        <span>{formatYear(last)}</span>
      </div>
    )
  }

  return (
        <div className="sticky top-8">
          <svg
            width="200"
            height={H}
            viewBox={`0 0 200 ${H}`}
            role="img"
            aria-label={`Position of ${active.name.latin} in the thread, ${first} to ${last}`}
          >
            <line
              x1={44}
              x2={44}
              y1={y(first)}
              y2={y(last)}
              className="stroke-firuze-ink"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {ordered.map((p) => {
              const isActive = p.id === active.id
              const top = y(p.span.start.max)
              const bottom = y(p.span.end.min)
              return (
                <g key={p.id}>
                  <line
                    x1={44}
                    x2={44}
                    y1={y(p.span.start.min)}
                    y2={y(p.span.end.max)}
                    className={isActive ? 'stroke-zarrin/30' : 'stroke-transparent'}
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                  <line
                    x1={isActive ? 44 : 50}
                    x2={isActive ? 44 : 50}
                    y1={top}
                    y2={bottom}
                    className={isActive ? 'stroke-zarrin' : 'stroke-kashi/45'}
                    strokeWidth={isActive ? 4 : 2}
                    strokeLinecap="round"
                  />
                  <text
                    x={0}
                    y={top + 4}
                    className={`text-[11px] tabular-nums ${
                      isActive ? 'fill-zarrin-ink' : 'fill-debu-ink'
                    }`}
                  >
                    {formatYear(p.span.start.min)}
                  </text>
                  {isActive ? (
                    <>
                      <circle cx={44} cy={top} r={5} className="fill-zarrin-ink" />
                      <text x={60} y={top + 4} className="fill-kashi text-[13px] font-semibold">
                        {p.name.latin}
                      </text>
                      <text x={60} y={top + 20} className="fill-debu-ink text-[11px] italic">
                        you are here
                      </text>
                    </>
                  ) : hasPage(p.id) ? (
                    <Link href={`/polity/${p.id}/`}>
                      <text
                        x={60}
                        y={top + 4}
                        className="fill-debu-ink text-[12px] hover:fill-firuze-ink"
                      >
                        {p.name.latin}
                      </text>
                    </Link>
                  ) : (
                    /* Context polity: on the rail for the shape of the era, but
                       it has no chapters and so no page to send the reader to. */
                    <text x={60} y={top + 4} className="fill-debu-ink/60 text-[12px]">
                      {p.name.latin}
                    </text>
                  )}
                </g>
              )
            })}
    </svg>
    </div>
  )
}
