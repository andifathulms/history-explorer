/**
 * Who else was there.
 *
 * Derived entirely from spans already in the corpus — no new sourcing, and no
 * new claim beyond the dates each polity's own record already carries.
 *
 * The one thing worth being careful about is that spans here are ranges. The
 * Samanids began in 819 or 892 depending on which start a source is willing to
 * call the beginning, and whether they were contemporary with something that
 * ended in 880 depends on which answer you take. Collapsing that to a midpoint
 * would manufacture a fact; asserting overlap on the widest reading would
 * overstate one. So overlap is computed twice:
 *
 * - **certain**: the conservative windows intersect — latest possible start to
 *   earliest possible end. These two polities coexisted on every reading of
 *   the dates.
 * - **possible**: only the widest windows intersect. Whether they overlapped
 *   depends on which cited date you accept, and the page says so rather than
 *   choosing.
 *
 * This is the same instinct as percentiling longevity at both endpoints rather
 * than at a midpoint: the range is what the sources give, so the range is what
 * gets carried through.
 */

import type { Polity, ReferencePolity } from './types.ts'

export interface Window {
  from: number
  to: number
}

export interface Contemporary {
  id: string
  name: string
  /** Reference-set entries have numbers but no page. */
  hasPage: boolean
  span: Window
  /** Years both were certainly extant. Zero where the overlap is only possible. */
  certainYears: number
}

export interface Contemporaries {
  certain: Contemporary[]
  possible: Contemporary[]
}

/** Latest possible start to earliest possible end. May be empty. */
function conservative(p: Polity): Window {
  return { from: p.span.start.max, to: p.span.end.min }
}

/** Earliest possible start to latest possible end. */
function widest(p: Polity): Window {
  return { from: p.span.start.min, to: p.span.end.max }
}

function overlapYears(a: Window, b: Window): number {
  return Math.min(a.to, b.to) - Math.max(a.from, b.from)
}

/** Overlapping at all, treating a shared instant as contact. */
function overlaps(a: Window, b: Window): boolean {
  return overlapYears(a, b) >= 0
}

/**
 * Everything whose span meets this polity's, from the narrative corpus and the
 * reference backdrop alike.
 *
 * The backdrop is included deliberately. Those fifty entries exist so that a
 * percentile is a statement about world history rather than a comparison
 * against eight things, and the same argument applies here: a list of
 * contemporaries drawn only from the polities that happen to have chapters
 * would describe this site's reading rather than the period.
 */
export function contemporariesOf(
  subject: Polity,
  narrative: Polity[],
  backdrop: ReferencePolity[],
): Contemporaries {
  const subjectTight = conservative(subject)
  const subjectWide = widest(subject)
  // A polity whose latest start falls after its earliest end has no window in
  // which it certainly existed, so nothing can certainly be contemporary with
  // it. Everything it meets is a possible overlap.
  const subjectHasTight = subjectTight.to >= subjectTight.from

  const certain: Contemporary[] = []
  const possible: Contemporary[] = []
  const seen = new Set<string>([subject.id])

  const consider = (
    id: string,
    name: string,
    hasPage: boolean,
    tight: Window,
    wide: Window,
  ) => {
    if (seen.has(id)) return
    seen.add(id)
    if (!overlaps(subjectWide, wide)) return
    const tightOverlap =
      subjectHasTight && tight.to >= tight.from ? overlapYears(subjectTight, tight) : -1
    if (tightOverlap >= 0) {
      certain.push({ id, name, hasPage, span: wide, certainYears: tightOverlap })
    } else {
      possible.push({ id, name, hasPage, span: wide, certainYears: 0 })
    }
  }

  for (const p of narrative) {
    consider(p.id, p.name.latin, !p.context_only, conservative(p), widest(p))
  }
  for (const r of backdrop) {
    const w = { from: r.span.start, to: r.span.end }
    consider(r.id, r.name, false, w, w)
  }

  const byStart = (a: Contemporary, b: Contemporary) =>
    a.span.from - b.span.from || a.name.localeCompare(b.name)
  certain.sort(byStart)
  possible.sort(byStart)
  return { certain, possible }
}
