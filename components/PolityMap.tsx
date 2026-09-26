import type { Polity } from '@/lib/types'
import { formatYear } from '@/lib/years'
import { getBasemap, blurFor } from '@/lib/basemap'
import { NO_FIGURE, formatKm2 } from '@/lib/gaps'
import { SectionHead } from '@/components/Shell'
import { MapDrawing } from '@/components/MapDrawing'

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
      <section aria-labelledby="map-heading" className="mt-16">
        <SectionHead ground="paper" id="map-heading">
          Extent
        </SectionHead>
        {/* The subject is the dataset, not the collection: hard rule 11 makes
            the evidence a legitimate thing to write about, and what is true
            here is a fact about how historical-basemaps was drawn. */}
        <p className="max-w-measure text-body">
          {polity.id === 'tahirid'
            ? 'The 800 and 900 snapshots show Khurasan inside the Abbasid Caliphate, which is what the Tahirids formally were — so the dataset is right and there is correctly nothing to draw.'
            : `The historical-basemaps snapshots are world maps at fixed years, and none of the ones falling inside this polity's lifetime names it among the polities it draws.`}
        </p>
      </section>
    )
  }

  const drift = Math.abs(map.snapshotYear - map.peakYear)
  const clio = map.dataset === 'cliopatria'
  // A Cliopatria row is valid for a range of years; when that range contains
  // the cited peak, the shape is the dataset's own shape for the peak year.
  const coversPeak = !!map.range && map.range[0] <= map.peakYear && map.peakYear <= map.range[1]

  return (
    <section aria-labelledby="map-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="map-heading"
        aside={
          <span>
            An illustration, not a measurement
          </span>
        }
      >
        Extent
      </SectionHead>

      <div className="grid max-w-data gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:grid-rows-[auto_1fr] md:items-start md:gap-y-6">
        <div className="overflow-hidden rounded-xl border border-dawat-edge bg-dawat-sink">
          <MapDrawing polity={polity} map={map} />
        </div>
        <div className="text-[15px] leading-relaxed md:col-start-2 md:row-span-2 md:row-start-1">
          {/* Never in a footnote. The polygon is not the peak. */}
          {clio && map.range ? (
            <>
              <p className="label text-debu-ink">Dataset years</p>
              <p className="mt-1 font-mono text-[22px] tabular-nums text-kashi-deep">
                {formatYear(map.range[0])}–{formatYear(map.range[1])}
              </p>
              <p className="mt-2 text-debu-ink">
                {coversPeak ? (
                  <>
                    Cliopatria gives one shape for these years, and they contain the cited peak of{' '}
                    <span className="tabular-nums">{formatYear(map.peakYear)}</span>. It is still
                    one reading of a frontier, not a survey.
                  </>
                ) : (
                  <>
                    The nearest range Cliopatria gives to the cited peak of{' '}
                    <span className="tabular-nums">{formatYear(map.peakYear)}</span>. It is not the
                    peak.
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="label text-debu-ink">Snapshot year</p>
              <p className="mt-1 font-mono text-[22px] tabular-nums text-kashi-deep">
                {formatYear(map.snapshotYear)}
              </p>
              <p className="mt-2 text-debu-ink">
                This is the nearest available snapshot to the cited peak of{' '}
                <span className="tabular-nums">{formatYear(map.peakYear)}</span>
                {drift ? `, ${drift} year${drift === 1 ? '' : 's'} away` : ''}. It is not the peak.
              </p>
            </>
          )}

          <p className="label mt-6 text-debu-ink">Cited extent</p>
          <p
            className={
              cited
                ? 'mt-1 font-mono text-[22px] tabular-nums text-kashi-deep'
                : 'mt-1 italic text-debu-ink'
            }
          >
            {cited ? formatKm2(cited.value) : NO_FIGURE}
          </p>
          <p className="mt-2 text-debu-ink">
            {cited
              ? 'The area of the shape on the left will not match this figure. That is expected. The cited figure is the figure; the map is an illustration, and the two are never reconciled.'
              : 'No source in this set gives an extent for this polity. The shape on the left is still only an illustration.'}
          </p>

          {/* What the two fills are. The shapes were drawn in two treatments
              with nothing anywhere saying which was which, so a reader had to
              infer that the bright one was the subject — on a map whose whole
              point is that it is an illustration and not a measurement. */}
          <dl className="mt-6 border-t border-kashi/15 pt-4">
            <div className="flex items-baseline gap-3 py-1.5">
              <dt aria-hidden="true" className="mt-1 h-3.5 w-6 shrink-0 bg-dawat-sink p-[3px]">
                <span className="block h-full w-full bg-kashi-soft/75" />
              </dt>
              <dd className="text-[14px] leading-snug text-debu-ink">
                <span className="text-kashi-deep">{polity.name.latin}</span>, as the{' '}
                {clio ? 'dataset' : 'snapshot'} draws it
              </dd>
            </div>
            <div className="flex items-baseline gap-3 py-1.5">
              <dt aria-hidden="true" className="mt-1 h-3.5 w-6 shrink-0 bg-dawat-sink p-[3px]">
                <span className="block h-full w-full border border-kaghaz/[0.13] bg-dawat-lift" />
              </dt>
              <dd className="text-[14px] leading-snug text-debu-ink">
                {clio
                  ? 'Everything else alive in the same years'
                  : 'Everything else on the same snapshot'}
              </dd>
            </div>
            <div className="flex items-baseline gap-3 py-1.5">
              <dt aria-hidden="true" className="mt-1 h-3.5 w-6 shrink-0 bg-dawat-sink p-[3px]">
                <span className="block h-full w-full bg-dawat-raise" />
              </dt>
              <dd className="text-[14px] leading-snug text-debu-ink">
                Land the dataset assigns to no polity, on a modern coastline
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-debu-ink">
            {clio ? (
              <>
                Cliopatria does not grade its borders, so every edge is drawn at the softest
                setting. A frontier in this period was a zone of control, not a line.
              </>
            ) : (
              <>
                Edges are blurred from the dataset&rsquo;s own border-precision field. Every feature
                in this period is marked <span className="tabular-nums">1</span>, approximate, so
                every border here dissolves.
              </>
            )}
          </p>
        </div>
        {/* The caveat is its own grid item: under the map on a wide screen,
            after the side panel on a narrow one, so the year stays next to
            the map at every width. */}
        <div className="md:col-start-1">
          {clio ? (
            <p className="max-w-measure text-[15px] leading-relaxed text-debu-ink">
              The maintainers&rsquo; caveat, which belongs here rather than in the footnotes: these
              maps reflect only one version of the territory held by past polities, and border
              uncertainties and differing opinions on names, territorial changes and durations are
              common. Boundaries from{' '}
              <a
                href="https://github.com/Seshat-Global-History-Databank/cliopatria"
                rel="noreferrer"
                className="text-kashi underline underline-offset-2 hover:text-firuze-ink"
              >
                Cliopatria
              </a>
              , Seshat Global History Databank, CC-BY-4.0; coordinates rounded and trimmed to the
              region.
            </p>
          ) : (
            <p className="max-w-measure text-[15px] leading-relaxed text-debu-ink">
              The dataset author&rsquo;s caveat, which belongs here rather than in the footnotes:
              territorial boundary as a concept is meaningful in Europe only after Westphalia,
              ancient polities overlap, and old vector borders drawn on modern coastlines mislead
              because rivers and shorelines move. Boundaries from{' '}
              <a
                href="https://github.com/aourednik/historical-basemaps"
                rel="noreferrer"
                className="text-kashi underline underline-offset-2 hover:text-firuze-ink"
              >
                historical-basemaps
              </a>
              , CC-BY-4.0.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
