import Link from 'next/link'
import { formatYear, formatRange } from '@/lib/years'
import type { Polity } from '@/lib/types'
import { hasPage } from '@/lib/content'

/**
 * The rail on a polity page. Same line as the landing view, compressed to fit a
 * sticky column, scrolled to nothing — the whole sequence is visible at once and
 * the current polity is marked, so you always know where in it you are standing.
 *
 * On mobile it becomes a scrolling row of the region's polities. It used to be
 * a three-pixel bar with a year at each end and a gold segment on it, which
 * named nothing, linked to nothing and rendered above the breadcrumb — so the
 * first thing a phone reader met was an unlabelled stripe, and mobile had no
 * way to reach a sibling polity anywhere on the page. The desktop rail was the
 * instrument and the mobile version was a decoration of it. Now both say the
 * same thing: here is the sequence, here is where you are standing, and here
 * is how to leave.
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
    return (
      <nav aria-label="This thread" className="lg:hidden">
        <p className="kicker text-debu-ink">
          In this thread <span className="tabular-nums">{formatYear(first)}</span>&ndash;
          <span className="tabular-nums">{formatYear(last)}</span>
        </p>

        {/* Bleeds to both edges so the row reads as scrollable rather than as
            a list that happens to be cut off. */}
        <ul className="-mx-5 mt-3 flex snap-x gap-px overflow-x-auto border-y border-kashi/15 bg-kashi/15 px-5 sm:-mx-8 sm:px-8">
          {ordered.map((p) => {
            const isActive = p.id === active.id
            const years = formatRange(p.span.start.min, p.span.start.max)
            const body = (
              <>
                <span className="block font-mono text-micro uppercase tabular-nums text-debu-ink">
                  {years}
                </span>
                <span
                  className={`mt-1 block text-[14px] leading-snug ${
                    isActive ? 'font-semibold text-zarrin-ink' : 'text-kashi'
                  }`}
                >
                  {p.name.latin}
                </span>
                {isActive ? (
                  <span className="mt-1 block text-[12px] italic text-debu-ink">
                    you are here
                  </span>
                ) : null}
              </>
            )
            return (
              <li
                key={p.id}
                className={`w-[152px] shrink-0 snap-start bg-kaghaz-raise ${
                  isActive ? 'border-t-2 border-zarrin' : ''
                }`}
              >
                {isActive || !hasPage(p.id) ? (
                  <span
                    className={`block px-3 py-3 ${isActive ? '' : 'opacity-70'}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {body}
                  </span>
                ) : (
                  <Link
                    href={`/polity/${p.id}/`}
                    className="block px-3 py-3 transition-colors hover:bg-kaghaz-lift"
                  >
                    {body}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
        // No sticky of its own: the gutter's own container is the sticky one
        // now, and the rail is a module inside it. Two nested stickies pin
        // against each other and the inner one simply stops moving.
        <div>
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
