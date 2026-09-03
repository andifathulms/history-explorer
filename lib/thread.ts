/**
 * Geometry for the thread: the continuous vertical line that runs down every
 * page and never breaks.
 *
 * The line is a time axis, so position on it encodes date and overlaps are
 * visible without being narrated — the Saffarids and Samanids ran concurrently
 * and hostile, and the reader can see that from the shape alone.
 *
 * Both the landing view and the polity-page rail import this, so a year is at
 * the same place on both and moving between them does not relocate the reader.
 */

import type { Edge, Polity } from './types.ts'

/** Pixels per year. Chosen so the whole 819-1231 span is a comfortable scroll. */
export const PX_PER_YEAR = 3.2
export const TOP_PAD = 48
export const BOTTOM_PAD = 64

export interface ThreadScale {
  first: number
  last: number
  height: number
  y: (year: number) => number
  /** Inverse, for hit-testing a scrub position back to a year. */
  yearAt: (y: number) => number
}

export function makeScale(polities: Polity[]): ThreadScale {
  const first = Math.min(...polities.map((p) => p.span.start.min))
  const last = Math.max(...polities.map((p) => p.span.end.max))
  const y = (year: number) => TOP_PAD + (year - first) * PX_PER_YEAR
  return {
    first,
    last,
    height: TOP_PAD + (last - first) * PX_PER_YEAR + BOTTOM_PAD,
    y,
    yearAt: (py: number) => first + (py - TOP_PAD) / PX_PER_YEAR,
  }
}

export interface Band {
  polity: Polity
  lane: number
  /** Certain extent: latest possible start to earliest possible end. */
  yStart: number
  yEnd: number
  /** Uncertain extent, drawn softer at both ends where the sources disagree. */
  yStartMin: number
  yEndMax: number
  hasStartRange: boolean
  hasEndRange: boolean
}

/**
 * Assign each polity a lane so concurrent ones sit side by side.
 *
 * Greedy first-fit over polities sorted by start. Bands must not merely avoid
 * overlapping in time, they must stay visually apart, so a lane is only reused
 * after a gap — otherwise two labels collide and the concurrency the layout
 * exists to show becomes unreadable.
 */
export function layoutBands(polities: Polity[], scale: ThreadScale, labelGapPx = 34): Band[] {
  const sorted = [...polities].sort((a, b) => a.span.start.min - b.span.start.min)
  const laneEnds: number[] = []
  const bands: Band[] = []

  for (const p of sorted) {
    const yStartMin = scale.y(p.span.start.min)
    const yEndMax = scale.y(p.span.end.max)

    let lane = laneEnds.findIndex((end) => yStartMin > end + labelGapPx)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(yEndMax)
    } else {
      laneEnds[lane] = yEndMax
    }

    bands.push({
      polity: p,
      lane,
      yStart: scale.y(p.span.start.max),
      yEnd: scale.y(p.span.end.min),
      yStartMin,
      yEndMax,
      hasStartRange: p.span.start.min !== p.span.start.max,
      hasEndRange: p.span.end.min !== p.span.end.max,
    })
  }

  return bands
}

export const laneX = (lane: number, gutter = 26) => gutter + lane * gutter

/** Edges that have a year, in thread order, for labelling down the rail. */
export function datedEdges(edges: Edge[]): Edge[] {
  return edges
    .filter((e): e is Edge & { year: number } => e.year !== null)
    .sort((a, b) => a.year - b.year)
}

/** Century marks for the axis. Decades would be noise at this scale. */
export function centuryTicks(scale: ThreadScale): number[] {
  const ticks: number[] = []
  for (let y = Math.ceil(scale.first / 100) * 100; y <= scale.last; y += 100) ticks.push(y)
  return ticks
}
