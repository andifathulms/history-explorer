import Link from 'next/link'
import type { Edge, Polity } from '@/lib/types'
import { layoutBands, laneX, makeScale, centuryTicks } from '@/lib/thread'

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

  const dated = edges.filter((e) => e.year !== null)

  return (
    <div className="relative overflow-x-auto">
      <svg
        width="100%"
        height={scale.height}
        viewBox={`0 0 720 ${scale.height}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label={`The succession thread from ${scale.first} to ${scale.last}, ${polities.length} polities`}
        className="min-w-[720px]"
      >
        {/* Century marks. Quiet: they orient, they do not compete. */}
        {centuryTicks(scale).map((year) => (
          <g key={year} className="thread-tick">
            <line
              x1={railX - 8}
              x2={700}
              y1={scale.y(year)}
              y2={scale.y(year)}
              stroke="currentColor"
              className="text-kashi/25"
              strokeWidth={1}
            />
            <text
              x={0}
              y={scale.y(year) + 4}
              className="fill-debu-paper text-[12px] tabular-nums"
            >
              {year}
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
          style={{ ['--len' as string]: scale.height }}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {bands.map((b, i) => {
          const x = railX + laneX(b.lane) - 26
          const active = b.polity.id === activeId
          const href = `/polity/${b.polity.id}/`
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
              <Link href={href}>
                <text
                  x={labelX}
                  y={b.yStart + 5}
                  className={`thread-label text-[15px] ${
                    active ? 'fill-zarrin' : 'fill-kaghaz'
                  } hover:fill-firuze`}
                >
                  {b.polity.name.latin}
                  <tspan className="fill-debu-paper text-[12px] tabular-nums">
                    {'  '}
                    {b.polity.span.start.min}
                    {b.hasStartRange ? `–${b.polity.span.start.max}` : ''}
                    {' – '}
                    {b.polity.span.end.min}
                    {b.hasEndRange ? `–${b.polity.span.end.max}` : ''}
                  </tspan>
                </text>
              </Link>
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
        {dated.map((e, i) => (
          <text
            key={`${e.from}-${e.to}-${e.type}-${i}`}
            x={520}
            y={scale.y(e.year as number) + 4}
            className="thread-label fill-debu-paper text-[12px] italic"
            style={{
              ['--d' as string]: `${(((e.year as number) - scale.first) / (scale.last - scale.first) * 1.1).toFixed(2)}s`,
            }}
          >
            {e.year} · {e.type}
            {e.contested ? ' (contested)' : ''}
          </text>
        ))}
      </svg>
    </div>
  )
}
