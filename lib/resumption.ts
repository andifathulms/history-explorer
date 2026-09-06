/**
 * The same-object relation: two records that are one polity, seen twice, with
 * an interruption between them.
 *
 * Pure and separate from content.ts so the rules can be tested. The rules are
 * strict because the failure mode is soft: unlike every other relation on this
 * site, this one has no event and no date behind it — it is a judgement about
 * identity — and without these checks nothing stops it becoming a general
 * "related to" that means nothing.
 *
 * The long argument for why it is a field and not an edge is on `Polity.resumes`
 * in types.ts.
 */
import type { Edge, Polity } from './types.ts'

export interface Resumption {
  /** The earlier record this one continues, where it names one. */
  resumes?: Polity
  /** The later record that names this one. Derived, never stored. */
  resumedBy?: Polity
}

/** Both directions for one polity. The reverse view is computed, not stored. */
export function resumptionOf(all: Polity[], id: string): Resumption {
  const self = all.find((p) => p.id === id)
  return {
    resumes: self?.resumes ? all.find((p) => p.id === self.resumes) : undefined,
    resumedBy: all.find((p) => p.resumes === id),
  }
}

/**
 * Every rule the field has to satisfy, as messages. Empty means valid.
 *
 * Returned rather than thrown so the caller decides what a violation is, and so
 * a test can assert on the reason rather than on the fact of a failure.
 */
export function checkResumptions(all: Polity[], edges: Edge[]): string[] {
  const problems: string[] = []
  const claimed = new Map<string, string>()

  for (const p of all) {
    if (p.resumes === undefined) continue
    const target = all.find((x) => x.id === p.resumes)

    if (!target) {
      problems.push(`${p.id}: resumes references unknown polity "${p.resumes}"`)
      continue
    }
    if (target.id === p.id) {
      problems.push(`${p.id}: a polity cannot resume itself`)
      continue
    }

    // Strictly earlier, with no overlap on any reading of either span. Two
    // polities that coexisted are contemporaries, which is a different section
    // of this site; calling them one object would be false, not imprecise.
    if (target.span.end.max >= p.span.start.min) {
      problems.push(
        `${p.id}: resumes "${target.id}", which ends in ${target.span.end.max} and does not ` +
          `close before this record opens in ${p.span.start.min}. Overlapping polities are ` +
          'contemporaries, not the same object seen twice',
      )
    }

    // One link per earlier record and per later record. Two records resuming
    // the same predecessor is a contradiction; a chain would claim three states
    // are one thing, which no source in this corpus does.
    const already = claimed.get(target.id)
    if (already) problems.push(`${p.id}: "${target.id}" is already resumed by "${already}"`)
    claimed.set(target.id, p.id)

    if (target.resumes !== undefined) {
      problems.push(
        `${p.id}: "${target.id}" itself resumes "${target.resumes}". The relation does not ` +
          'chain: it says two records are one object, and a chain of three would assert ' +
          'something no source in this corpus does',
      )
    }

    // An edge between the pair would say the relation is a succession, which is
    // the whole thing this field exists to avoid saying.
    const joined = edges.some(
      (e) =>
        (e.from === p.id && e.to === target.id) || (e.from === target.id && e.to === p.id),
    )
    if (joined) {
      problems.push(
        `${p.id}: an edge already joins "${target.id}" and "${p.id}". A pair is either a ` +
          'succession or the same object resuming, and this site does not assert both',
      )
    }
  }

  return problems
}
