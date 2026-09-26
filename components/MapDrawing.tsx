import type { Polity } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { blurFor, type BasemapView } from '@/lib/basemap'

/**
 * The drawing itself, shared by the Extent section and the polity page's hero.
 *
 * Two copies of one map sit on the same page, so every id in the SVG carries
 * a prefix: a second `#land` would clip the hero's shape with the section's
 * path, or the other way round, depending only on document order.
 *
 * What a reader needs to read it — the snapshot year, the cited figure beside
 * it, the note that the two are never reconciled — lives with each caller, not
 * here, because each says it at a different length.
 */
export function MapDrawing({
  polity,
  map,
  idPrefix = 'map',
  labels = true,
}: {
  polity: Polity
  map: BasemapView
  idPrefix?: string
  /** Dataset names on the shapes. Off where the drawing is too small to read. */
  labels?: boolean
}) {
  const clio = map.dataset === 'cliopatria'
  const key = `${idPrefix}-${polity.id}`
  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      width="100%"
      role="img"
      aria-label={
        clio && map.range
          ? `${polity.name.latin} as Cliopatria draws it for ${formatYear(map.range[0])}–${formatYear(map.range[1])}`
          : `${polity.name.latin} on the ${formatYear(map.snapshotYear)} basemap snapshot`
      }
    >
      <defs>
        {[0, 1.5, 4].map((b) => (
          <filter
            key={b}
            id={`${key}-soft-${b}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {b > 0 ? <feGaussianBlur stdDeviation={b} /> : null}
          </filter>
        ))}
        {/* The blur says a frontier is uncertain. A coast is not a
            frontier, so the subject is clipped to land: soft where it
            met a neighbour, sharp where it met the sea. */}
        <path id={`${key}-land-shape`} d={map.land} />
        <clipPath id={`${key}-land`}>
          <use href={`#${key}-land-shape`} />
        </clipPath>
      </defs>

      {/* Three steps of the one ground, darkest to lightest: sea,
        land nobody is drawn holding, and the neighbours. No neighbour
        gets a hue of its own — DESIGN.md: a map that recolours by
        civilisation asserts a character for each one. The grid goes
        under the land so it shows only at sea. */}
      <path
        d={map.graticule}
        fill="none"
        className="stroke-kaghaz/[0.07]"
        strokeWidth={0.5}
      />
      <use href={`#${key}-land-shape`} className="fill-dawat-raise" />

      {map.context.map((c, i) => (
        // Flat and opaque, not a translucent wash: the datasets overlap
        // their own polygons, and at 10% each overlap stacked into a
        // different grey, so the neighbours read as a stain rather than
        // as states.
        <path
          key={i}
          d={c.d}
          className="fill-dawat-lift stroke-kaghaz/[0.13]"
          strokeWidth={0.6}
          strokeLinejoin="round"
        >
          <title>{c.name}</title>
        </path>
      ))}

      <g clipPath={`url(#${key}-land)`}>
        {map.subject.map((s, i) => (
          <path
            key={i}
            d={s.d}
            className="fill-kashi-soft/75 stroke-kashi-soft"
            strokeWidth={1.5}
            filter={`url(#${key}-soft-${blurFor(s.precision)})`}
          >
            {/* A single string. React takes one text child on <title>
            and drops the rest, so this had been shipping empty on
            every map since it was written: the shapes had no
            accessible name at all. */}
            <title>
              {clio
                ? `${s.name} — Cliopatria does not grade border precision`
                : `${s.name} — border precision ${
                    s.precision === 3
                      ? '3, determined by international law'
                      : s.precision === 2
                        ? '2, moderately precise'
                        : '1, approximate'
                  }`}
            </title>
          </path>
        ))}
      </g>

      {/* Names from the dataset itself, spelling included. Too small to
        read on a phone, where the legend carries the subject alone. */}
      <g className={`${labels ? 'hidden md:inline' : 'hidden'} font-mono`} aria-hidden="true">
        {map.labels.map((l) => (
          <text
            key={l.name}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={l.subject ? 9 : 8}
            letterSpacing="0.08em"
            paintOrder="stroke"
            strokeWidth={3}
            strokeLinejoin="round"
            className={
              l.subject
                ? 'fill-kaghaz stroke-kashi-deep/60'
                : 'fill-debu-paper stroke-dawat-lift'
            }
          >
            {l.name.toUpperCase()}
          </text>
        ))}
      </g>
    </svg>
  )
}
