import Link from 'next/link'
import type { Contemporary } from '@/lib/contemporaries'
import { formatSpan, formatYear } from '@/lib/years'
import { SectionHead } from '@/components/Shell'

/**
 * What else existed while this did.
 *
 * Costs no sourcing — every date here is already on the polity's own record —
 * and it is the best available answer to "was this big?" for the twenty-three
 * polities with no reach figure at all. Srivijaya cannot be ranked on extent
 * and can be placed among the Tang, the Abbasids and the Tibetan empire, which
 * tells a reader more than an empty axis does.
 *
 * Reference-set entries appear here unlinked. They have numbers and no page,
 * and including them is the point: a list of contemporaries drawn only from the
 * polities that happen to have chapters would describe this site's reading
 * rather than the period.
 *
 * Long lists are folded. The Abbasids overlap a hundred and seven records, and
 * a hundred and seven names is not a list a reader reads — on a phone, in one
 * column, it ran to roughly eight screens of names wedged between the turning
 * points and the map. So the first dozen show and the rest go behind a
 * disclosure.
 *
 * Which dozen is a real decision, and it is made on the only number here that
 * is not arbitrary: `certainYears`, the length of the overlap on the
 * conservative reading of both spans. The longest overlaps are the polities
 * this one actually shared a world with, as against the ones it brushed for a
 * decade at either end. They are then put back into date order to be read,
 * because the fold is about how many are shown and not about the order they
 * are shown in. The heading says both numbers, so the count is never hidden.
 *
 * A `<details>` rather than a client component: it costs no JavaScript across
 * two hundred and twelve pages, it works before hydration, and browsers open
 * it for find-in-page, which a hidden div does not.
 */

/** How many show before the fold, and the point at which folding is worth it. */
const SHOWN = 12
const FOLD_ABOVE = 16

function Row({ c }: { c: Contemporary }) {
  const label = (
    <>
      {c.name}
      <span className="ms-2 font-mono text-[13px] tabular-nums text-debu-ink">
        {formatSpan(c.span.from, c.span.to)}
      </span>
    </>
  )
  return (
    // A 26px row was the tap target on a list of links. The link is a block so
    // the whole row is hittable, and the row clears 40px.
    <li className="break-inside-avoid">
      {c.hasPage ? (
        <Link
          href={`/polity/${c.id}/`}
          className="link-underline block py-2 text-kashi hover:text-firuze-ink"
        >
          {label}
        </Link>
      ) : (
        // No `title`: the caption under the list already says that unlinked
        // entries are here for scale, and a hover note is unreachable on touch.
        <span className="block py-2 text-debu-ink">{label}</span>
      )}
    </li>
  )
}

/**
 * The overlaps as a picture: each contemporary a bar on one axis, the
 * polity's own span shaded behind them, and the stretch they shared drawn
 * dark. Lengths are the cited spans and nothing else — the same grammar as the
 * timeline, at the scale of one polity's world.
 */
function Overlaps({ list, span }: { list: Contemporary[]; span: [number, number] }) {
  const lo = Math.min(span[0], ...list.map((c) => c.span.from))
  const hi = Math.max(span[1], ...list.map((c) => c.span.to))
  const pct = (y: number) => ((y - lo) / (hi - lo)) * 100
  const step = [10, 20, 25, 50, 100, 200, 250, 500, 1000].find((x) => (hi - lo) / x <= 6) ?? 1000
  const ticks: number[] = []
  for (let y = Math.ceil(lo / step) * step; y <= hi; y += step) ticks.push(y)

  return (
    <figure className="card-paper px-4 py-4 sm:px-5">
      <div className="relative">
        {/* The band sits under the track column only. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 right-0 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
          <span />
          <span className="relative">
            <span
              className="absolute inset-y-0 bg-kashi-wash/70"
              style={{ left: `${pct(span[0])}%`, width: `${pct(span[1]) - pct(span[0])}%` }}
            />
          </span>
        </div>
        <ul className="relative">
          {list.map((c) => {
            const o0 = Math.max(c.span.from, span[0])
            const o1 = Math.min(c.span.to, span[1])
            const name = (
              <>
                {c.name}
                <span className="sr-only">, {formatSpan(c.span.from, c.span.to)}</span>
              </>
            )
            return (
              <li
                key={c.id}
                className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-center gap-x-3 py-[3px] sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
              >
                {c.hasPage ? (
                  <Link
                    href={`/polity/${c.id}/`}
                    className="truncate text-right font-sans text-[13px] text-kashi hover:text-firuze-ink"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="truncate text-right font-sans text-[13px] text-debu-ink">{name}</span>
                )}
                <span aria-hidden="true" className="relative h-3">
                  <span
                    className="absolute top-0 h-3 rounded-[3px] bg-kashi-soft/30"
                    style={{ left: `${pct(c.span.from)}%`, width: `${pct(c.span.to) - pct(c.span.from)}%` }}
                  />
                  {o1 > o0 ? (
                    <span
                      className="absolute top-0 h-3 rounded-[2px] bg-kashi"
                      style={{ left: `${pct(o0)}%`, width: `${pct(o1) - pct(o0)}%` }}
                    />
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div aria-hidden="true" className="mt-1.5 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-x-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <span />
        <span className="relative h-4 font-mono text-[10.5px] tabular-nums text-debu-ink">
          {ticks.map((t, i) => (
            // Every other label on a phone, where six of them run together.
            <span
              key={t}
              className={`absolute -translate-x-1/2 ${i % 2 ? 'hidden sm:inline' : ''}`}
              style={{ left: `${pct(t)}%` }}
            >
              {t === 0 ? 'AD 1' : formatYear(t)}
            </span>
          ))}
        </span>
      </div>
      <figcaption className="mt-3 font-sans text-[12.5px] text-debu-ink">
        The shaded band is this polity&rsquo;s span; the dark part of each bar is the
        stretch the two shared.
      </figcaption>
    </figure>
  )
}

/**
 * One list, folded where it is long enough to be a wall.
 *
 * Below the threshold nothing is hidden and no disclosure renders, so most
 * polities see exactly what they saw before.
 */
function Folded({
  list,
  noun,
  span,
}: {
  list: Contemporary[]
  noun: string
  span: [number, number]
}) {
  const byDate = (a: Contemporary, b: Contemporary) =>
    a.span.from - b.span.from || a.name.localeCompare(b.name)

  if (list.length <= FOLD_ABOVE) {
    return <Overlaps list={[...list].sort(byDate)} span={span} />
  }

  const longest = [...list]
    .sort((a, b) => b.certainYears - a.certainYears || a.name.localeCompare(b.name))
    .slice(0, SHOWN)
  const shownIds = new Set(longest.map((c) => c.id))
  const shown = longest.sort(byDate)
  const rest = list.filter((c) => !shownIds.has(c.id)).sort(byDate)

  return (
    <>
      <Overlaps list={shown} span={span} />

      <p className="mt-3 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        The {SHOWN} that {noun} longest, in date order.
      </p>

      <details className="mt-2 group">
        <summary className="inline-block cursor-pointer font-sans text-[13.5px] font-semibold text-firuze-ink hover:text-kashi">
          Show the remaining {rest.length}
        </summary>
        <ul className="mt-3 max-w-data columns-1 gap-x-10 sm:columns-2 lg:columns-3">
          {rest.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </ul>
      </details>
    </>
  )
}

export function Contemporaries({
  certain,
  possible,
  span,
}: {
  certain: Contemporary[]
  possible: Contemporary[]
  /** The polity's own outer span, shaded behind the overlaps. */
  span: [number, number]
}) {
  // Nothing renders rather than a sentence about what these pages hold. Every
  // other empty state on a polity page says something true about the past —
  // that a polity had no fixed seat, that no source names a hinge — and this
  // one could only ever have said something about the collection, which is the
  // habit hard rule 12 exists to stop. A reader who is told nothing here loses
  // nothing; a reader told what is absent from the corpus learns about the
  // corpus, which is not what they came for.
  if (!certain.length && !possible.length) return null

  return (
    <section aria-labelledby="contemporaries-heading" className="mt-16">
      <SectionHead
        ground="paper"
        id="contemporaries-heading"
        aside={
          <span>
            <span className="font-mono tabular-nums">{certain.length + possible.length}</span>{' '}
            overlapping
          </span>
        }
      >
        Contemporaries
      </SectionHead>

      {certain.length ? <Folded list={certain} noun="overlapped" span={span} /> : null}

      {/* The honest half. Both spans are ranges, and for these two the answer
          depends on which cited date you accept — so the page says that
          instead of picking one and printing a fact. */}
      {possible.length ? (
        <div className="mt-6 border-t border-kashi/15 pt-4">
          <h3 className="label mb-2 text-debu-ink">
            Possibly, depending on which dates you accept
          </h3>
          <div className="mt-2">
            <Folded list={possible} noun="may have overlapped" span={span} />
          </div>
        </div>
      ) : null}

      <p className="mt-5 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        Derived from cited spans, not from a separate source. Where both spans
        are ranges and they meet only on the widest reading of each, the pair is
        listed as possible rather than resolved to one answer. Unlinked entries
        are here for scale and are not written up.
      </p>
    </section>
  )
}
