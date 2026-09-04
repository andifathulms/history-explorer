'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Polity, ReferencePolity, WorldDenominator } from '@/lib/types'
import {
  AXES,
  AXIS_LABELS,
  DEFAULT_WEIGHTS,
  INFLUENCE_KEYS,
  INFLUENCE_LABELS,
  PRESETS,
  BOARDS,
  BOARD_META,
  NORMALISATION_LABELS,
  axisCoverage,
  buildField,
  rate,
  sortForBoard,
  weightsFromQuery,
  weightsToQuery,
  type Board,
  type Normalisation,
  type Scale,
  type Weights,
} from '@/lib/ratings'
import { NO_FIGURE, formatKm2, formatPopulation } from '@/lib/gaps'
import { ordinal } from '@/lib/ratings'

/**
 * The ranked table with weight sliders. Not the front door — the thread is.
 *
 * The ranking here belongs to the reader, not to the site. The site publishes
 * no "greatest empire" ordering of its own, so every column that fuses anything
 * is a function of the sliders, and the weights live in the URL so a view can
 * be sent to someone.
 *
 * Read on mount from window.location rather than useSearchParams, because a
 * static export has no server to read a query string on and the Suspense
 * bail-out that useSearchParams forces would buy nothing here.
 */
export function Comparison({
  narrative,
  backdrop,
  denominators,
}: {
  narrative: Polity[]
  backdrop: ReferencePolity[]
  denominators: WorldDenominator[]
}) {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS)
  const [scale, setScale] = useState<Scale>('absolute')
  const [normalisation, setNormalisation] = useState<Normalisation>('percentile')
  const [board, setBoard] = useState<Board>('overall')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const parsed = weightsFromQuery(window.location.search.replace(/^\?/, ''))
    setWeights(parsed.weights)
    setScale(parsed.scale)
    setNormalisation(parsed.normalisation)
    setBoard(parsed.board)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const qs = weightsToQuery(weights, scale, normalisation, board)
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`)
  }, [weights, scale, normalisation, board, ready])

  const coverage = useMemo(
    () => axisCoverage(narrative, scale, denominators),
    [narrative, scale, denominators],
  )

  // Unrankable rows are kept apart rather than sorted to the bottom. A polity
  // with no cited extent is not the smallest polity here.
  const { ranked, unranked } = useMemo(() => {
    const field = buildField(narrative, backdrop, scale, denominators)
    const rated = narrative.map((p) => rate(p, field, weights, scale, denominators, normalisation))
    return sortForBoard(rated, board)
  }, [narrative, backdrop, denominators, weights, scale, normalisation, board])

  const meta = BOARD_META[board]

  const setAxis = (k: 'reach' | 'longevity' | 'demographic' | 'influence', v: number) =>
    setWeights((w) => ({ ...w, [k]: v }))

  const setMix = (k: (typeof INFLUENCE_KEYS)[number], v: number) =>
    setWeights((w) => ({ ...w, influenceMix: { ...w.influenceMix, [k]: v } }))

  const eraGapped = scale === 'era-normalised'

  return (
    <>
      <div className="mt-12 grid gap-8 lg:grid-cols-[264px_1fr]">
        <aside className="card-paper p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="kicker text-debu-ink">Your weights</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => setWeights(preset.weights)}
                className="rounded-full border border-kashi/30 px-3 py-1 font-mono text-micro uppercase text-kashi transition-colors hover:border-firuze-ink hover:text-firuze-ink"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            {AXES.map((a) => (
              <label key={a} className="block">
                <span className="flex items-baseline justify-between">
                  <span className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-kashi">
                    {AXIS_LABELS[a]}
                  </span>
                  <span className="font-mono text-[13px] tabular-nums text-debu-ink">
                    {weights[a].toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights[a]}
                  onChange={(e) => setAxis(a, Number(e.target.value))}
                  className="mt-2 w-full accent-firuze-ink"
                />
                {/* An axis can be weighted to 1.00 and move nothing. Population
                    is null for every polity here and every entry in the
                    backdrop, so this slider is a control over an empty field —
                    counted rather than hard-coded, so it stops saying so the
                    day a figure is entered. */}
                <span
                  className={`mt-1 block font-mono text-micro tabular-nums ${
                    coverage[a].carried === 0 ? 'text-zarrin-ink' : 'text-debu-ink'
                  }`}
                >
                  {coverage[a].carried === 0
                    ? 'no polity carries this axis'
                    : `${coverage[a].carried} of ${coverage[a].of} carry it`}
                </span>
              </label>
            ))}
          </div>

          <h3 className="kicker mt-8 border-t border-kashi/15 pt-6 text-debu-ink">
            How to fuse influence
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-debu-ink">
            The site never combines these three itself. These sliders do it in your view
            only, and travel in the link.
          </p>
          <div className="mt-5 space-y-5">
            {INFLUENCE_KEYS.map((k) => (
              <label key={k} className="block">
                <span className="flex items-baseline justify-between">
                  <span className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-kashi">
                    {INFLUENCE_LABELS[k]}
                  </span>
                  <span className="font-mono text-[13px] tabular-nums text-debu-ink">
                    {weights.influenceMix[k].toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights.influenceMix[k]}
                  onChange={(e) => setMix(k, Number(e.target.value))}
                  className="mt-2 w-full accent-firuze-ink"
                />
              </label>
            ))}
          </div>

          <fieldset className="mt-8 border-t border-kashi/15 pt-6">
            <legend className="kicker text-debu-ink">Scale</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['absolute', 'era-normalised'] as Scale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  aria-pressed={scale === s}
                  className={`rounded-full border px-3 py-1 font-mono text-micro uppercase transition-colors ${
                    scale === s
                      ? 'border-firuze-ink bg-firuze-ink text-kaghaz'
                      : 'border-kashi/30 text-kashi hover:border-firuze-ink'
                  }`}
                >
                  {s === 'absolute' ? 'Absolute' : 'Era-normalised'}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-debu-ink">
              A million km² in 500 BC is not a million km² in 1900, so both scales are
              offered.
            </p>
          </fieldset>

          <fieldset className="mt-8 border-t border-kashi/15 pt-6">
            <legend className="kicker text-debu-ink">How position is measured</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(NORMALISATION_LABELS) as Normalisation[]).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNormalisation(n)}
                  aria-pressed={normalisation === n}
                  className={`rounded-full border px-3 py-1 font-mono text-micro uppercase transition-colors ${
                    normalisation === n
                      ? 'border-firuze-ink bg-firuze-ink text-kaghaz'
                      : 'border-kashi/30 text-kashi hover:border-firuze-ink'
                  }`}
                >
                  {NORMALISATION_LABELS[n]}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-debu-ink">
              Percentile answers how many it beat, and compresses the top: the Mongol
              empire and the Umayyad caliphate both sit near the hundredth while differing
              by more than the whole Sasanian empire. Log magnitude answers how much
              bigger. Neither is more correct, and where they disagree that is worth
              seeing. The three influence counts stay on percentile in both modes — they
              run 0 to 3 and span no orders of magnitude for a logarithm to express.
            </p>
          </fieldset>
        </aside>

        <div className="min-w-0">
          {/* Several rankings, not one. A single ordering reads as the site's
              opinion about which polity was greatest, which is the claim the
              PRD refuses to make; naming the question each board answers is
              what keeps them apart. Two of the five are the reader's own and
              say so. */}
          <nav aria-label="Rankings" className="mb-6">
            <div className="flex flex-wrap gap-2">
              {BOARDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBoard(b)}
                  aria-pressed={board === b}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-micro uppercase tracking-[0.06em] transition-colors ${
                    board === b
                      ? 'border-kashi bg-kashi text-kaghaz'
                      : 'border-kashi/30 text-kashi hover:border-firuze-ink hover:text-firuze-ink'
                  }`}
                >
                  {BOARD_META[b].label}
                </button>
              ))}
            </div>

            <p className="mt-4 max-w-measure text-[15px] leading-relaxed">
              <span className="font-display text-[17px] text-kashi-deep">
                {meta.question}
              </span>{' '}
              <span className="text-debu-ink">{meta.note}</span>
            </p>

            {meta.readerOwned ? (
              <p className="mt-2 max-w-measure font-mono text-micro uppercase tracking-[0.06em] text-zarrin-ink">
                This ordering is yours, not the site&rsquo;s
              </p>
            ) : null}
          </nav>

          {unranked.length ? (
            <p className="mb-5 max-w-measure text-[15px] text-debu-ink">
              {unranked.length}{' '}
              {unranked.length === 1 ? 'polity carries' : 'polities carry'} no figure this
              board can order, and {unranked.length === 1 ? 'sits' : 'sit'} below the
              ranking rather than at the bottom of it. Unranked is not last place.
            </p>
          ) : null}

          {eraGapped ? (
            <p className="mb-5 max-w-measure border-s-2 border-zarrin-ink ps-4 text-[15px] text-debu-ink">
              Era-normalised reach reads as a gap for every polity here. The denominator
              it needs — world land under state control at a given date — is not carried
              by any source this site cites, and summing the reference set to manufacture
              one would be a computation presented as a measurement. The axis stays empty
              until a real series is added, rather than quietly falling back to the
              absolute figures.
            </p>
          ) : null}

          {/* A rank number, and a percentile bar in every axis column rather
              than only in the total. Length is a cited quantity here too: a
              polity missing an axis leaves that bar area empty and says so in
              words, because a short bar would read as "small" when the truth
              is "unknown". */}
          {/* No negative-margin bleed here. That trick is for a full-width
              section; inside a two-column grid it pulled the table into the
              sidebar gutter and added 54px of scrollWidth, so the table showed
              a horizontal scrollbar on a desktop that had room for it. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <caption className="sr-only">
                Polities ranked by your weighted total, with each axis&rsquo;s cited figure
              </caption>
              <colgroup>
                <col className="w-[3rem]" />
                <col className="w-[15rem]" />
                <col className="w-[9.5rem]" />
                <col className="w-[9.5rem]" />
                <col className="w-[9.5rem]" />
                <col className="w-[11rem]" />
                <col className="w-[7.5rem]" />
              </colgroup>
              <thead>
                <tr className="border-b border-kashi/30">
                  {['#', 'Polity', 'Reach', 'Longevity', 'Population', 'Influence', 'Total'].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="py-3 pe-4 align-bottom font-mono text-micro font-normal uppercase text-debu-ink"
                      >
                        {h === '#' ? <span className="sr-only">Rank</span> : h}
                        {/* The three counts need naming once, not on all 66
                            rows — repeated under every cell they wrapped to
                            three lines and made the table twice as tall as the
                            data in it. */}
                        {h === 'Influence' ? (
                          <span className="mt-1 block whitespace-nowrap normal-case tracking-normal">
                            scripts · religions · claims
                          </span>
                        ) : null}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {[...ranked, ...unranked].map((r, i) => (
                  <tr
                    key={r.polity.id}
                    className="border-b border-kashi/12 align-top transition-colors hover:bg-kaghaz-raise"
                  >
                    <td className="py-4 pe-4 font-mono text-[13px] tabular-nums text-debu-ink">
                      {i < ranked.length ? String(i + 1).padStart(2, '0') : '—'}
                    </td>

                    <th scope="row" className="py-4 pe-4 font-normal">
                      <Link
                        href={`/polity/${r.polity.id}/`}
                        className="link-underline font-display text-[18px] font-semibold text-kashi-deep hover:text-firuze-ink"
                      >
                        {r.polity.latin}
                      </Link>
                      <span className="mt-1 block font-mono text-[11.5px] text-debu-ink">
                        {r.totalProvenance}
                      </span>
                    </th>

                    <AxisCell
                      figure={
                        r.reach.raw.present
                          ? scale === 'absolute'
                            ? formatKm2(r.reach.raw.value)
                            : `${(r.reach.raw.value * 100).toFixed(1)}%`
                          : null
                      }
                      pct={r.reach.pct.present ? r.reach.pct.value : null}
                    />

                    <AxisCell
                      figure={
                        r.longevity.years.min === r.longevity.years.max
                          ? `${r.longevity.years.min} yr`
                          : `${r.longevity.years.min}–${r.longevity.years.max} yr`
                      }
                      pct={r.longevity.pct.min.present ? r.longevity.pct.min.value : null}
                      pctMax={
                        r.longevity.pct.min.present &&
                        r.longevity.pct.max.present &&
                        Math.abs(r.longevity.pct.max.value - r.longevity.pct.min.value) > 0.005
                          ? r.longevity.pct.max.value
                          : undefined
                      }
                    />

                    <AxisCell
                      figure={
                        r.demographic.raw.present
                          ? formatPopulation(r.demographic.raw.value)
                          : null
                      }
                      pct={r.demographic.pct.present ? r.demographic.pct.value : null}
                    />

                    {/* Three numbers, never one, even in a table cell. */}
                    <td className="py-4 pe-4">
                      <span className="font-mono text-[15px] tabular-nums text-dawat/85">
                        {INFLUENCE_KEYS.map((k) => {
                          const c = r.influence.counts[k].count
                          return c === null ? '—' : c
                        }).join(' · ')}
                      </span>
                      <span className="sr-only">
                        descendant scripts, religions carried, successor claims
                      </span>
                    </td>

                    <td className="py-4">
                      {r.total.present ? (
                        <>
                          <span className="font-mono text-[19px] tabular-nums text-kashi-deep">
                            {Math.round(r.total.value * 100)}
                          </span>
                          <span className="mt-2 block h-[6px] w-full rounded-full bg-kashi/10">
                            <span
                              className="block h-[6px] rounded-full bg-kashi"
                              style={{ width: `${Math.max(2, r.total.value * 100)}%` }}
                            />
                          </span>
                        </>
                      ) : (
                        <span className="text-[14px] italic text-debu-ink">{NO_FIGURE}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 max-w-measure text-[15px] leading-relaxed text-debu-ink">
            Every total states how many axes it was computed from and is renormalised
            across those only. A polity with two documented axes is never pushed below one
            with four for the sake of the missing ones. Percentiles are against these
            eight plus a backdrop of fifty-one polities from world history — except the
            influence counts, which percentile against these eight alone, because coding
            influence for the backdrop without reading fifty sources is exactly what the
            coding rules forbid.
          </p>
        </div>
      </div>
    </>
  )
}

/**
 * One measured cell: the cited figure, then a bar whose length is the
 * percentile. A missing figure leaves the bar area empty and says No cited
 * figure — never a short bar, which would say "small" when the truth is
 * "unknown".
 *
 * `pctMax` draws the second end of a contested longevity range, so a polity
 * whose span the sources disagree about carries a rank that is honestly a
 * range rather than a point.
 */
function AxisCell({
  figure,
  pct,
  pctMax,
}: {
  figure: string | null
  pct: number | null
  pctMax?: number
}) {
  return (
    <td className="py-4 pe-4">
      {figure === null ? (
        <span className="text-[14px] italic text-debu-ink">{NO_FIGURE}</span>
      ) : (
        <>
          <span className="font-mono text-[15px] tabular-nums text-dawat/85">{figure}</span>
          <span className="mt-2 block h-[6px] w-full rounded-full bg-kashi/10">
            {pct === null ? null : (
              <>
                <span
                  className="block h-[6px] rounded-full bg-kashi/55"
                  style={{ width: `${Math.max(2, pct * 100)}%` }}
                />
                {pctMax === undefined ? null : (
                  <span
                    className="-mt-[6px] block h-[6px] rounded-full bg-kashi/25"
                    style={{
                      marginInlineStart: `${pct * 100}%`,
                      width: `${Math.max(1, (pctMax - pct) * 100)}%`,
                    }}
                  />
                )}
              </>
            )}
          </span>
          {pct === null ? null : (
            <span className="mt-1 block font-mono text-micro tabular-nums text-debu-ink">
              {pctMax === undefined
                ? ordinal(Math.round(pct * 100))
                : `${Math.round(pct * 100)}–${ordinal(Math.round(pctMax * 100))}`}
            </span>
          )}
        </>
      )}
    </td>
  )
}
