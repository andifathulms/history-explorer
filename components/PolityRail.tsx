import Link from 'next/link'
import { formatYear, formatRange } from '@/lib/years'
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
/**
 * SVG text does not wrap, so a long name runs past the viewBox and is clipped:
 * "Umayyad Caliphate of Cordoba" arrived as "Umayyad Caliphate of Cord". The
 * rail is a sidebar and cannot simply be widened, so names break onto a second
 * line at the last word that fits.
 *
 * The width is estimated from the character count rather than measured — there
 * is no layout engine at build time — which is why the budget is deliberately
 * conservative.
 */
function wrapName(name: string, maxChars = 21): [string] | [string, string] {
  if (name.length <= maxChars) return [name]
  const cut = name.lastIndexOf(' ', maxChars)
  if (cut <= 0) return [name]
  return [name.slice(0, cut), name.slice(cut + 1)]
}

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
  // The year gutter has to hold "879-1011", not just "879". Before this the
  // rail printed start.min at a y computed from start.max, so the Ghurids'
  // 879 sat where 1011 belongs and the column read as though it were unsorted.
  // A number beside a time axis has to be the number that position means.
  const RAIL_X = 60
  const NAME_X = 76
  const W = 224
  const y = (year: number) => PAD + ((year - first) / (last - first)) * (H - PAD * 2)
  const pct = (year: number) => (((year - first) / (last - first)) * 100).toFixed(2)

  const ordered = [...polities].sort((a, b) => a.span.start.min - b.span.start.min)

  /**
   * Labels are placed by date and dates cluster, so they collide.
   *
   * With two polities in a region this never showed. Anatolia now has seven,
   * four of which begin within thirty years of each other, and the rail
   * rendered "Danishmendid Dynasty" and "Sultanate of Rum" on top of one
   * another — two lines of type in the same place, both unreadable.
   *
   * The fix keeps the measurement honest and moves only the writing. Each
   * polity's bar and marker stay at the y its dates put them at; the label is
   * pushed down until it clears the one above, and a leader line joins the two
   * when they have come apart. A reader can still read the position off the
   * axis, which is the thing that has to stay true — the label is a caption,
   * not a datum.
   */
  const LINE = 13
  const rowsFor = (p: Polity) =>
    wrapName(p.name.latin).length + (p.id === active.id ? 1 : 0)

  const anchor = ordered.map((p) => y(p.span.start.max))
  const label: number[] = []
  let cursor = -Infinity
  ordered.forEach((p, i) => {
    const placed = Math.max(anchor[i], cursor)
    label.push(placed)
    cursor = placed + rowsFor(p) * LINE + 6
  })
  // The axis is a fixed height; a run of pushed labels can need more room than
  // it has, so the canvas grows rather than the captions overlapping again.
  const CANVAS = Math.max(H, (label[label.length - 1] ?? 0) + LINE * 3)

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
        <div className="sticky top-24">
          <svg
            width={W}
            height={CANVAS}
            viewBox={`0 0 ${W} ${CANVAS}`}
            role="img"
            aria-label={`Position of ${active.name.latin} in the thread, ${first} to ${last}`}
          >
            <line
              x1={RAIL_X}
              x2={RAIL_X}
              y1={y(first)}
              y2={y(last)}
              className="stroke-firuze-ink"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {ordered.map((p, i) => {
              const isActive = p.id === active.id
              const top = anchor[i]
              const bottom = y(p.span.end.min)
              // Where the caption actually sits, after being pushed clear.
              const at = label[i]
              const shifted = at - top > 1
              return (
                <g key={p.id}>
                  {shifted ? (
                    <line
                      x1={RAIL_X + 6}
                      y1={top}
                      x2={NAME_X - 6}
                      y2={at}
                      className={isActive ? 'stroke-zarrin/50' : 'stroke-kashi/25'}
                      strokeWidth={1}
                    />
                  ) : null}
                  <line
                    x1={RAIL_X}
                    x2={RAIL_X}
                    y1={y(p.span.start.min)}
                    y2={y(p.span.end.max)}
                    className={isActive ? 'stroke-zarrin/30' : 'stroke-transparent'}
                    strokeWidth={7}
                    strokeLinecap="round"
                  />
                  <line
                    x1={isActive ? RAIL_X : RAIL_X + 6}
                    x2={isActive ? RAIL_X : RAIL_X + 6}
                    y1={top}
                    y2={bottom}
                    className={isActive ? 'stroke-zarrin' : 'stroke-kashi/45'}
                    strokeWidth={isActive ? 4 : 2}
                    strokeLinecap="round"
                  />
                  <text
                    x={0}
                    y={at + 4}
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive ? 'fill-zarrin-ink' : 'fill-debu-ink'
                    }`}
                  >
                    {formatRange(p.span.start.min, p.span.start.max)}
                  </text>
                  {isActive ? (
                    <>
                      <circle cx={RAIL_X} cy={top} r={5} className="fill-zarrin-ink" />
                      <text x={NAME_X} y={at + 4} className="fill-kashi text-[13px] font-semibold">
                        {wrapName(p.name.latin).map((line, i) => (
                          <tspan key={i} x={NAME_X} dy={i === 0 ? 0 : 14}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                      <text
                        x={NAME_X}
                        y={at + 4 + wrapName(p.name.latin).length * 16}
                        className="fill-debu-ink text-[11px] italic"
                      >
                        you are here
                      </text>
                    </>
                  ) : hasPage(p.id) ? (
                    <Link href={`/polity/${p.id}/`}>
                      <text
                        x={NAME_X}
                        y={at + 4}
                        className="fill-debu-ink text-[12px] hover:fill-firuze-ink"
                      >
                        {wrapName(p.name.latin).map((line, i) => (
                          <tspan key={i} x={NAME_X} dy={i === 0 ? 0 : 13}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    </Link>
                  ) : (
                    /* Context polity: on the rail for the shape of the era, but
                       it has no chapters and so no page to send the reader to. */
                    <text x={NAME_X} y={at + 4} className="fill-debu-ink/60 text-[12px]">
                      {wrapName(p.name.latin).map((line, i) => (
                        <tspan key={i} x={NAME_X} dy={i === 0 ? 0 : 13}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  )}
                </g>
              )
            })}
    </svg>
    </div>
  )
}
