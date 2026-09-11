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
          className="flex h-[150px] items-end gap-px border-b border-kashi/30"
        >
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

        <div className="mt-1.5 flex justify-between font-mono text-micro uppercase tabular-nums text-debu-ink">
          <span>{formatYear(first)}</span>
          <span>{formatYear(last)}</span>
        </div>

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
