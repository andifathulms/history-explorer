import type { Polity } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { getBasemap, blurFor } from '@/lib/basemap'
import { NO_FIGURE, formatKm2 } from '@/lib/gaps'

/**
 * The map. An illustration, and labelled as one.
 *
 * The three honesty requirements from PRD section 7 are all on screen rather
 * than in a footnote: the snapshot year sits next to the map at all times
 * because the polygon is the nearest snapshot and not the peak; the cited km²
 * is printed alongside with an explicit note that the two will not agree and
 * are not reconciled; and edge softness comes from the dataset's own
 * BORDERPRECISION field, so an imprecise border literally looks imprecise.
 */
export function PolityMap({ polity }: { polity: Polity }) {
  const map = getBasemap(polity.id)
  const cited = polity.measures.reach_km2

  if (!map) {
    return (
      <section aria-labelledby="map-heading" className="mt-14">
        <h2 id="map-heading" className="text-[15px] uppercase tracking-widest text-debu-ink">
          Extent
        </h2>
        <p className="mt-3 max-w-measure text-body">
          No snapshot in this series draws {polity.name.latin}.{' '}
          {polity.id === 'tahirid'
            ? 'The 800 and 900 snapshots show Khurasan inside the Abbasid Caliphate, which is what the Tahirids formally were — so the dataset is right and there is correctly nothing to draw.'
            : 'Their imperial career fell between two snapshot years and left no mark on either.'}
        </p>
      </section>
    )
  }

  const drift = Math.abs(map.snapshotYear - map.peakYear)

  return (
    <section aria-labelledby="map-heading" className="mt-14">
      <h2 id="map-heading" className="text-[15px] uppercase tracking-widest text-debu-ink">
        Extent
      </h2>

      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_15rem] md:items-start">
        <div className="overflow-hidden rounded-sm bg-dawat">
          <svg
            viewBox={`0 0 ${map.width} ${map.height}`}
            width="100%"
            role="img"
            aria-label={`${polity.name.latin} on the ${formatYear(map.snapshotYear)} basemap snapshot`}
          >
            <defs>
              {[0, 1.5, 4].map((b) => (
                <filter key={b} id={`soft-${polity.id}-${b}`} x="-20%" y="-20%" width="140%" height="140%">
                  {b > 0 ? <feGaussianBlur stdDeviation={b} /> : null}
                </filter>
              ))}
            </defs>

            {map.context.map((c, i) => (
              <path key={i} d={c.d} className="fill-kaghaz/5 stroke-kaghaz/10" strokeWidth={0.5} />
            ))}

            {map.subject.map((s, i) => (
              <path
                key={i}
                d={s.d}
                className="fill-kashi/45 stroke-firuze-ink"
                strokeWidth={1.5}
                filter={`url(#soft-${polity.id}-${blurFor(s.precision)})`}
              >
                <title>
                  {s.name} — border precision{' '}
                  {s.precision === 3
                    ? '3, determined by international law'
                    : s.precision === 2
                      ? '2, moderately precise'
                      : '1, approximate'}
                </title>
              </path>
            ))}
          </svg>
        </div>

        <div className="text-[15px]">
          {/* Never in a footnote. The polygon is not the peak. */}
          <p className="text-kashi">
            Snapshot year <span className="font-semibold tabular-nums">{formatYear(map.snapshotYear)}</span>
          </p>
          <p className="mt-1 text-debu-ink">
            This is the nearest available snapshot to the cited peak of{' '}
            <span className="tabular-nums">{formatYear(map.peakYear)}</span>
            {drift ? `, ${drift} years away` : ''}. It is not the peak.
          </p>

          <p className="mt-4 text-kashi">
            Cited extent{' '}
            <span className="font-semibold tabular-nums">
              {cited ? formatKm2(cited.value) : NO_FIGURE}
            </span>
          </p>
          <p className="mt-1 text-debu-ink">
            {cited
              ? 'The area of the shape on the left will not match this figure. That is expected. The cited figure is the figure; the map is an illustration, and the two are never reconciled.'
              : 'No source in this set gives an extent for this polity. The shape on the left is still only an illustration.'}
          </p>

          <p className="mt-4 text-debu-ink">
            Edges are blurred from the dataset&rsquo;s own border-precision field. Every
            feature in this period is marked <span className="tabular-nums">1</span>,
            approximate, so every border here dissolves.
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-measure text-[15px] text-debu-ink">
        The dataset author&rsquo;s caveat, which belongs here rather than in the
        footnotes: territorial boundary as a concept is meaningful in Europe only after
        Westphalia, ancient polities overlap, and old vector borders drawn on modern
        coastlines mislead because rivers and shorelines move. Boundaries from{' '}
        <a
          href="https://github.com/aourednik/historical-basemaps"
          rel="noreferrer"
          className="text-kashi underline underline-offset-2 hover:text-firuze-ink"
        >
          historical-basemaps
        </a>
        , CC-BY-4.0.
      </p>
    </section>
  )
}
