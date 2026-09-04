import type { Polity } from '@/lib/types'
import { formatKm2 } from '@/lib/gaps'
import { formatYear } from '@/lib/years'
import { citeShort } from '@/lib/content'
import { SectionHead } from '@/components/Shell'

/**
 * The cited extents, at the dates they are cited for.
 *
 * The one design decision worth defending: **the points are not joined**.
 *
 * A line from 909 to 969 asserts an extent in 940, and no source published one.
 * That is precisely the interpolation hard rule 2 forbids — it would just be
 * committed in pixels rather than in YAML, where it is harder to notice and
 * impossible to cite. The same reasoning as hard rule 5, which refuses to
 * compute km² from a polygon: a picture that reads as a measurement is a
 * measurement, and it is held to the same standard as one.
 *
 * So the trajectory is columns standing at the years the sources name, with
 * nothing between them. A reader can see rise, peak and loss perfectly well
 * from four columns; what they cannot do is read a number off a year nobody
 * measured.
 *
 * Renders only where two or more figures exist. One column is not a trajectory,
 * and the peak figure is already on the masthead.
 */
export function ExtentTrajectory({ polity }: { polity: Polity }) {
  const points = polity.measures.extent
  if (points.length < 2) return null

  const peak = points.reduce((a, b) => (b.km2 > a.km2 ? b : a))
  const ceiling = peak.km2

  // The widest window the cited dates support, which the loader has already
  // guaranteed every point falls inside.
  const from = polity.span.start.min
  const to = polity.span.end.max
  const width = Math.max(1, to - from)
  const at = (year: number) => ((year - from) / width) * 100

  const first = points[0]
  const last = points[points.length - 1]

  return (
    <section aria-labelledby="extent-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="extent-heading"
        aside={
          <span className="font-mono text-micro uppercase text-debu-ink">
            {points.length} cited figures
          </span>
        }
      >
        Extent over time
      </SectionHead>

      <figure className="mt-6 max-w-[52rem]">
        <div
          role="img"
          aria-label={`Cited extents for ${polity.name.latin}: ${points
            .map((p) => `${formatKm2(p.km2)} in ${formatYear(p.at)}`)
            .join('; ')}. Nothing is claimed for the years between them.`}
          className="relative h-[168px] border-b border-kashi/30"
        >
          {points.map((p) => {
            const isPeak = p.at === peak.at
            return (
              <div
                key={p.at}
                className="absolute bottom-0 -translate-x-1/2"
                style={{ left: `${at(p.at)}%`, height: `${(p.km2 / ceiling) * 100}%` }}
              >
                <div
                  className={`h-full w-[7px] rounded-t-[2px] ${
                    isPeak ? 'bg-kashi' : 'bg-kashi/45'
                  }`}
                  title={`${formatKm2(p.km2)} at ${formatYear(p.at)}`}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-micro tabular-nums text-debu-ink">
                  {formatYear(p.at)}
                </span>
              </div>
            )
          })}
        </div>

        {/* The axis is the polity's own life, so the ends are labelled. A
            column standing well short of the right edge is the page saying
            the last measurement predates the ending, which is usually true
            and always worth seeing. */}
        <div className="mt-1.5 flex justify-between font-mono text-micro uppercase tabular-nums text-debu-ink">
          <span>{formatYear(from)}</span>
          <span>{formatYear(to)}</span>
        </div>

        <figcaption className="mt-5 max-w-measure text-[14px] leading-relaxed text-debu-ink">
          Each column is a figure a source printed for the year it stands on.
          They are deliberately not joined: no source gives an extent for the
          years in between, and a line across them would be an estimate drawn
          rather than written. Highest cited figure {formatKm2(peak.km2)} at{' '}
          {formatYear(peak.at)}; the series runs {formatYear(first.at)} to{' '}
          {formatYear(last.at)}.
        </figcaption>
      </figure>

      {/* The authoritative rendering. The columns show the shape; this is the
          data, with the citation on every row. */}
      <ol className="mt-6 max-w-[52rem]">
        {points.map((p) => (
          <li
            key={p.at}
            className="border-t border-kashi/15 py-2.5 sm:grid sm:grid-cols-[7rem_11rem_1fr] sm:gap-6"
          >
            <span className="font-mono text-[13px] uppercase tabular-nums tracking-[0.06em] text-debu-ink">
              {formatYear(p.at)}
            </span>
            <span className="tabular-nums text-kashi">{formatKm2(p.km2)}</span>
            <span className="text-[14px] text-dawat/75">
              <cite className="not-italic">{citeShort(p.source)}</cite>
              {p.note ? <span className="text-debu-ink"> — {p.note}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
