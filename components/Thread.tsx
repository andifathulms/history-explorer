import Link from 'next/link'
import { formatYear, formatRange } from '@/lib/years'
import { edgeParties, type Edge, type Polity } from '@/lib/types'
import { layoutBands, laneX, makeScale, centuryTicks } from '@/lib/thread'
import { hasPage, displayName } from '@/lib/content'

/**
 * The landing view's thread: 819 to 1231, drawn once.
 *
 * Nothing else on the site is allowed to be as loud, so this is the only place
 * the turquoise runs at full length and the only place anything animates on its
 * own. The draw is CSS-only — no effect, no state, no hydration — which also
 * means prefers-reduced-motion is honoured by the stylesheet rather than by a
 * media query read in JavaScript that could arrive a frame late.
 */
export function Thread({
  polities,
  edges,
  activeId,
}: {
  polities: Polity[]
  edges: Edge[]
  activeId?: string
}) {
  const scale = makeScale(polities)
  const bands = layoutBands(polities, scale)
  const lanes = Math.max(...bands.map((b) => b.lane)) + 1
  const railX = 56
  const labelX = railX + lanes * 26 + 18
  /**
   * The viewBox used to be 720 wide against a container of about 1,176, so
   * everything on this page was drawn and then scaled up by 1.63 — names set at
   * 15px arrived at 24px, and the whole chart got a third taller than it was
   * designed to be. Matching the viewBox to the real width means the type is the
   * size it says it is, and it buys the room the edge labels needed.
   */
  const W = 1100
  const edgeX = Math.max(620, labelX + 360)

  // Edge labels are placed at their own year, which puts two of them on top of
  // each other whenever a transition took a couple of years — 900 and 901 in the
  // Iranian Intermezzo. Nudging the later one down keeps both readable; the year
  // is printed in the label, so the small offset costs no accuracy and the tick
  // marks still carry the true dates.
  const MIN_GAP = 16
  const dated = edges
    .filter((e) => e.year !== null)
    .sort((a, b) => (a.year as number) - (b.year as number))
    .reduce<{ edge: Edge; y: number }[]>((acc, edge) => {
      const wanted = scale.y(edge.year as number) + 4
      const prev = acc[acc.length - 1]
      acc.push({ edge, y: prev && wanted - prev.y < MIN_GAP ? prev.y + MIN_GAP : wanted })
      return acc
    }, [])

  return (
    <div className="relative overflow-x-auto">
      <svg
        width="100%"
        height={scale.height}
        viewBox={`0 0 ${W} ${scale.height}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label={`The succession thread from ${scale.first} to ${scale.last}, ${polities.length} polities`}
        className="min-w-[720px] max-w-[1100px]"
      >
        {/* Century marks. Quiet: they orient, they do not compete. */}
        {centuryTicks(scale).map((year) => (
          <g key={year} className="thread-tick">
            <line
              x1={railX - 8}
              x2={W - 20}
              y1={scale.y(year)}
              y2={scale.y(year)}
              stroke="currentColor"
              className="text-kashi/25"
              strokeWidth={1}
            />
            <text
              x={0}
              y={scale.y(year) + 4}
              className="fill-debu-paper font-mono text-[11px] tabular-nums"
            >
              {formatYear(year)}
            </text>
          </g>
        ))}

        {/* The thread itself. One line, drawn once, never broken. */}
        <line
          x1={railX}
          x2={railX}
          y1={scale.y(scale.first)}
          y2={scale.y(scale.last)}
          stroke="currentColor"
          className="thread-line text-firuze"
          // The dash length must be the line's own length, not the container's:
          // an over-long dasharray finishes the draw early and leaves dead time
          // at the end of the one moment the site animates.
          style={{ ['--len' as string]: scale.y(scale.last) - scale.y(scale.first) }}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {bands.map((b, i) => {
          const x = railX + laneX(b.lane) - 26
          const active = b.polity.id === activeId
          const href = `/polity/${b.polity.id}/`
          const linked = hasPage(b.polity.id)
          const delay = `${((b.yStartMin / scale.height) * 1.1).toFixed(2)}s`

          return (
            <g key={b.polity.id} className="thread-band" style={{ ['--d' as string]: delay }}>
              {/* Uncertain extent, where the cited start or end is a range. */}
              {(b.hasStartRange || b.hasEndRange) && (
                <line
                  x1={x}
                  x2={x}
                  y1={b.yStartMin}
                  y2={b.yEndMax}
                  stroke="currentColor"
                  className="text-firuze/25"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
              )}
              {/* Certain extent. */}
              <line
                x1={x}
                x2={x}
                y1={b.yStart}
                y2={b.yEnd}
                stroke="currentColor"
                className={active ? 'text-zarrin' : 'text-firuze/80'}
                strokeWidth={active ? 5 : 3}
                strokeLinecap="round"
              />
              <line
                x1={railX}
                x2={x}
                y1={b.yStart}
                y2={b.yStart}
                stroke="currentColor"
                className="text-firuze/40"
                strokeWidth={1}
              />
              {(() => {
                const label = (
                  <text
                    x={labelX}
                    y={b.yStart + 5}
                    className={`thread-label text-[15px] ${
                      active ? 'fill-zarrin' : linked ? 'fill-kaghaz' : 'fill-kaghaz/55'
                    } ${linked ? 'hover:fill-firuze' : ''}`}
                  >
                    {b.polity.name.latin}
                    <tspan className="fill-debu-paper font-mono text-[11px] tabular-nums">
                      {'  '}
                      {b.hasStartRange
                        ? formatRange(b.polity.span.start.min, b.polity.span.start.max)
                        : formatYear(b.polity.span.start.min)}
                      {/* An en-dash separator between two en-dashed ranges gave
                          "861 – 901–1003", which reads as three numbers and says
                          nothing. Where either end is contested the span gets a
                          word instead. */}
                      {b.hasStartRange || b.hasEndRange ? ' to ' : ' – '}
                      {b.hasEndRange
                        ? formatRange(b.polity.span.end.min, b.polity.span.end.max)
                        : formatYear(b.polity.span.end.min)}
                    </tspan>
                  </text>
                )
                // A context polity earns a band — the era's shape needs it — but
                // has no chapters, so there is nothing to link to.
                return linked ? <Link href={href}>{label}</Link> : label
              })()}
              {/* Anchor dot at the start of certain extent. */}
              <circle
                cx={x}
                cy={b.yStart}
                r={active ? 5 : 3.5}
                className={active ? 'fill-zarrin' : 'fill-firuze'}
              />
            </g>
          )
        })}

        {/* Edge labels. The label is the causation, so it gets space. */}
        {dated.map(({ edge: e, y }, i) => (
          <g
            key={`${e.from}-${e.to}-${e.type}-${i}`}
            className="thread-label"
            style={{
              ['--d' as string]: `${(((e.year as number) - scale.first) / (scale.last - scale.first) * 1.1).toFixed(2)}s`,
            }}
          >
            {/* A leader back to the edge's true year, so a nudged label still
                points at the date it belongs to. */}
            <line
              x1={edgeX - 22}
              x2={edgeX - 6}
              y1={scale.y(e.year as number)}
              y2={y - 4}
              stroke="currentColor"
              className="text-firuze/30"
              strokeWidth={1}
            />
            {/* Both ends, named. "1055 · overthrew" states a type and leaves out
                the causation, which is the one thing this section exists to
                record. The edge types are written to slot between the two
                names, so the label reads as the sentence it is. */}
            <text x={edgeX} y={y} className="fill-debu-paper text-[12px]">
              <tspan className="font-mono tabular-nums">
                {formatYear(e.year as number)}
              </tspan>
              {'  '}
              <tspan className="fill-kaghaz/80">{displayName(edgeParties(e).subject)}</tspan>
              {' '}
              <tspan className="italic">{e.type}</tspan>
              {' '}
              <tspan className="fill-kaghaz/80">{displayName(edgeParties(e).object)}</tspan>
              {e.contested ? <tspan className="fill-debu-paper"> (contested)</tspan> : null}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
