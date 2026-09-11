import { formatYear } from '@/lib/years'

/**
 * How many polities were running at once, century by century.
 *
 * The timeline's thesis is concurrency and its instrument was adjacency: rows
 * sorted by start date, so a neighbour is a contemporary. True, and far too
 * weak to carry the claim. Sixty-four polities were extant in the thirteenth
 * century and they sit scattered down nine thousand eight hundred pixels of
 * chart; reading the shape of that off the Gantt means holding twelve screens
 * in your head at once.
 *
 * This is the same fact in one screen. It asserts nothing the records do not
 * already carry — a polity is counted in a century when its widest cited span
 * touches it — and it needs no source of its own for the same reason the
 * contemporaries list needs none: every date in it is already on a record.
 *
 * The widest reading is deliberate. Using the conservative span would drop a
 * polity out of the century where the sources disagree about its edges, and
 * the question here is "how crowded was this century", not "who certainly
 * overlapped whom" — that one is asked on a polity page, where it is answered
 * twice and the disagreement is shown.
 */

export interface Span {
  start: number
  end: number
}

const CENTURY = 100

export function ConcurrencyProfile({ spans }: { spans: Span[] }) {
  if (!spans.length) return null

  const first = Math.floor(Math.min(...spans.map((s) => s.start)) / CENTURY) * CENTURY
  const last = Math.floor(Math.max(...spans.map((s) => s.end)) / CENTURY) * CENTURY

  const bins: { at: number; n: number }[] = []
  for (let c = first; c <= last; c += CENTURY) {
    bins.push({
      at: c,
      n: spans.filter((s) => s.start <= c + CENTURY - 1 && s.end >= c).length,
    })
  }

  const ceiling = Math.max(...bins.map((b) => b.n))
  const peak = bins.find((b) => b.n === ceiling)!

  /**
   * Ticks at round millennia, and a rule where the era turns over.
   *
   * Labelled only at its two ends, the profile showed a shape without a
   * position: the rise is plainly somewhere on the right, and nothing said
   * whether that is Rome or the Abbasids. The one division worth drawing is
   * BC to AD, because the asymmetry is the point — almost everything this
   * collection has read so far sits to the right of it.
   */
  const LABELLED = new Set([-2000, -1000, 0, 1000])
  const zeroIndex = bins.findIndex((b) => b.at === 0)

  return (
    <section aria-labelledby="profile-heading" className="mt-12 border-t border-kashi/15 pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="profile-heading" className="kicker text-debu-ink">
          How many at once
        </h2>
        <p className="font-mono text-micro uppercase text-debu-ink">
          peak <span className="tabular-nums text-zarrin-ink">{ceiling}</span> in the{' '}
          <span className="tabular-nums">{formatYear(peak.at)}s</span>
        </p>
      </div>

      <figure className="mt-6 max-w-data">
        <div
          role="img"
          aria-label={`Polities extant per century, ${formatYear(first)} to ${formatYear(
            last,
          )}. ${bins
            .filter((b) => b.n)
            .map((b) => `${formatYear(b.at)}s: ${b.n}`)
            .join('; ')}.`}
          className="relative flex h-[150px] items-end gap-px border-b border-kashi/30"
        >
          {zeroIndex > 0 ? (
            <span
              aria-hidden="true"
              style={{ left: `${(zeroIndex / bins.length) * 100}%` }}
              className="absolute inset-y-0 w-px bg-kashi/30"
            />
          ) : null}
          {bins.map((b) => (
            <span
              key={b.at}
              // A century with nothing in it still gets its slot, so the gaps
              // in the record are part of the shape rather than edited out of
              // the axis.
              style={{ height: `${(b.n / ceiling) * 100}%` }}
              className={`min-w-0 flex-1 rounded-t-[1px] ${
                b.n === ceiling ? 'bg-zarrin-ink' : 'bg-kashi/55'
              }`}
            />
          ))}
        </div>

        {/* One slot per column, so a tick sits under the century it names
            rather than at a percentage that has to be kept in step by hand. */}
        <div className="mt-1.5 flex gap-px font-mono text-micro uppercase tabular-nums text-debu-ink">
          {bins.map((b, i) => (
            <span key={b.at} className="relative min-w-0 flex-1">
              {i === 0 || i === bins.length - 1 || LABELLED.has(b.at) ? (
                <span
                  className={`absolute top-0 whitespace-nowrap ${
                    i === 0 ? 'start-0' : i === bins.length - 1 ? 'end-0' : '-translate-x-1/2'
                  }`}
                >
                  {b.at === 0 ? 'AD 1' : formatYear(b.at)}
                </span>
              ) : null}
            </span>
          ))}
        </div>
        {/* The labels are absolutely positioned, so the row has no height of
            its own to give the caption below it. */}
        <div className="h-4" aria-hidden="true" />

        <figcaption className="mt-4 max-w-measure text-[14px] leading-relaxed text-debu-ink">
          One column per century, counting every polity whose widest cited span
          touches it. Nothing here is sourced separately: every date in it is
          already on a record, the same way the contemporaries list on a polity
          page is derived rather than researched. The long thin left-hand half is
          not a gap in history — it is what this collection has read so far.
        </figcaption>
      </figure>
    </section>
  )
}
