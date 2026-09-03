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
  buildField,
  rate,
  weightsFromQuery,
  weightsToQuery,
  type Scale,
  type Weights,
} from '@/lib/ratings'
import { NO_FIGURE, formatKm2, formatPopulation } from '@/lib/gaps'

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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const parsed = weightsFromQuery(window.location.search.replace(/^\?/, ''))
    setWeights(parsed.weights)
    setScale(parsed.scale)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    const qs = weightsToQuery(weights, scale)
    window.history.replaceState(null, '', `${window.location.pathname}?${qs}`)
  }, [weights, scale, ready])

  const rows = useMemo(() => {
    const field = buildField(narrative, backdrop, scale, denominators)
    return narrative
      .map((p) => rate(p, field, weights, scale, denominators))
      .sort((a, b) => {
        // Polities with no computable total sort last rather than to zero.
        if (!a.total.present && !b.total.present) return 0
        if (!a.total.present) return 1
        if (!b.total.present) return -1
        return b.total.value - a.total.value
      })
  }, [narrative, backdrop, denominators, weights, scale])

  const setAxis = (k: 'reach' | 'longevity' | 'demographic' | 'influence', v: number) =>
    setWeights((w) => ({ ...w, [k]: v }))

  const setMix = (k: (typeof INFLUENCE_KEYS)[number], v: number) =>
    setWeights((w) => ({ ...w, influenceMix: { ...w.influenceMix, [k]: v } }))

  const eraGapped = scale === 'era-normalised'

  return (
    <>
      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <h2 className="text-[15px] uppercase tracking-widest text-debu">Your weights</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => setWeights(preset.weights)}
                className="rounded-sm border border-kashi/40 px-3 py-1 text-[14px] text-kashi hover:border-firuze hover:text-firuze"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {AXES.map((a) => (
              <label key={a} className="block">
                <span className="flex justify-between text-[15px]">
                  <span className="text-kashi">{AXIS_LABELS[a]}</span>
                  <span className="tabular-nums text-debu">{weights[a].toFixed(2)}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={weights[a]}
                  onChange={(e) => setAxis(a, Number(e.target.value))}
                  className="mt-1 w-full accent-firuze"
                />
              </label>
            ))}
          </div>

          <h3 className="mt-6 text-[15px] uppercase tracking-widest text-debu">
            How to fuse influence
          </h3>
          <p className="mt-1 text-[14px] text-debu">
            The site never combines these three itself. These sliders do it in your view
            only, and travel in the link.
          </p>
          <div className="mt-3 space-y-4">
            {INFLUENCE_KEYS.map((k) => (
              <label key={k} className="block">
                <span className="flex justify-between text-[15px]">
                  <span className="text-kashi">{INFLUENCE_LABELS[k]}</span>
                  <span className="tabular-nums text-debu">
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
                  className="mt-1 w-full accent-firuze"
                />
              </label>
            ))}
          </div>

          <fieldset className="mt-6">
            <legend className="text-[15px] uppercase tracking-widest text-debu">Scale</legend>
            <div className="mt-2 flex gap-2">
              {(['absolute', 'era-normalised'] as Scale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  aria-pressed={scale === s}
                  className={`rounded-sm border px-3 py-1 text-[14px] ${
                    scale === s
                      ? 'border-firuze text-firuze'
                      : 'border-kashi/40 text-kashi hover:border-firuze'
                  }`}
                >
                  {s === 'absolute' ? 'Absolute' : 'Era-normalised'}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[14px] text-debu">
              A million km² in 500 BC is not a million km² in 1900, so both scales are
              offered.
            </p>
          </fieldset>
        </aside>

        <div className="min-w-0">
          {eraGapped ? (
            <p className="mb-5 max-w-measure border-s-2 border-zarrin ps-4 text-[15px] text-debu">
              Era-normalised reach reads as a gap for every polity here. The denominator
              it needs — world land under state control at a given date — is not carried
              by any source this site cites, and summing the reference set to manufacture
              one would be a computation presented as a measurement. The axis stays empty
              until a real series is added, rather than quietly falling back to the
              absolute figures.
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <caption className="sr-only">
                Polities ranked by your weighted total, with each axis&rsquo;s cited figure
              </caption>
              <thead>
                <tr className="border-b border-kashi/30 text-[14px] uppercase tracking-wide text-debu">
                  <th scope="col" className="py-2 pe-3 font-normal">
                    Polity
                  </th>
                  <th scope="col" className="py-2 pe-3 font-normal">
                    Reach
                  </th>
                  <th scope="col" className="py-2 pe-3 font-normal">
                    Longevity
                  </th>
                  <th scope="col" className="py-2 pe-3 font-normal">
                    Population
                  </th>
                  <th scope="col" className="py-2 pe-3 font-normal">
                    Influence
                  </th>
                  <th scope="col" className="py-2 font-normal">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.polity.id} className="border-b border-kashi/15 align-top">
                    <th scope="row" className="py-3 pe-3 font-normal">
                      <Link
                        href={`/polity/${r.polity.id}/`}
                        className="font-semibold text-kashi hover:text-firuze"
                      >
                        {r.polity.latin}
                      </Link>
                      <span className="block text-[13px] text-debu">{r.totalProvenance}</span>
                    </th>

                    <td className="py-3 pe-3">
                      {r.reach.raw.present ? (
                        <>
                          <span className="tabular-nums">
                            {scale === 'absolute'
                              ? formatKm2(r.reach.raw.value)
                              : `${(r.reach.raw.value * 100).toFixed(1)}%`}
                          </span>
                          <span className="block text-[13px] text-debu">
                            {Math.round((r.reach.pct.present ? r.reach.pct.value : 0) * 100)}th
                          </span>
                        </>
                      ) : (
                        <span className="italic text-debu">{NO_FIGURE}</span>
                      )}
                    </td>

                    <td className="py-3 pe-3">
                      <span className="tabular-nums">
                        {r.longevity.years.min === r.longevity.years.max
                          ? `${r.longevity.years.min} yr`
                          : `${r.longevity.years.min}–${r.longevity.years.max} yr`}
                      </span>
                      <span className="block text-[13px] text-debu">
                        {Math.round(r.longevity.pct.min * 100)}
                        {Math.abs(r.longevity.pct.max - r.longevity.pct.min) > 0.005
                          ? `–${Math.round(r.longevity.pct.max * 100)}`
                          : ''}
                        th
                      </span>
                    </td>

                    <td className="py-3 pe-3">
                      {r.demographic.raw.present ? (
                        <span className="tabular-nums">
                          {formatPopulation(r.demographic.raw.value)}
                        </span>
                      ) : (
                        <span className="italic text-debu">{NO_FIGURE}</span>
                      )}
                    </td>

                    {/* Three numbers, never one, even in a table cell. */}
                    <td className="py-3 pe-3">
                      <span className="tabular-nums">
                        {INFLUENCE_KEYS.map((k) => {
                          const c = r.influence.counts[k].count
                          return c === null ? '—' : c
                        }).join(' · ')}
                      </span>
                      <span className="block text-[13px] text-debu">scripts · religions · claims</span>
                    </td>

                    <td className="py-3">
                      {r.total.present ? (
                        <>
                          <span className="tabular-nums text-[17px] text-kashi">
                            {Math.round(r.total.value * 100)}
                          </span>
                          <span className="mt-1 block h-[6px] w-24 rounded-full bg-kashi/10">
                            <span
                              className="block h-[6px] rounded-full bg-kashi"
                              style={{ width: `${Math.max(2, r.total.value * 100)}%` }}
                            />
                          </span>
                        </>
                      ) : (
                        <span className="italic text-debu">{NO_FIGURE}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-measure text-[15px] text-debu">
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
