/**
 * Territory that changed hands between two records whose losers survived.
 *
 * Pure and separate from content.ts so the rules can be tested, following
 * resumption.ts. The rules matter more than usual here because the failure mode
 * is quiet: nothing about a transfer looks wrong on its own page, and the two
 * ways this file can go bad — swallowing conquests that belong in edges.yaml,
 * or growing without bound until it means nothing — both show up as a file that
 * is merely large.
 *
 * The argument for why this is not a ninth edge type is on `Transfer` in
 * types.ts. The threshold a transfer must clear is coding rule 10.
 */
import type { Edge, Polity, Transfer } from './types.ts'

export interface Transfers {
  lost: Transfer[]
  gained: Transfer[]
}

/** Both directions for one polity. */
export function transfersOf(transfers: Transfer[], id: string): Transfers {
  return {
    lost: transfers.filter((t) => t.from === id),
    gained: transfers.filter((t) => t.to === id),
  }
}

/**
 * Every rule the file has to satisfy, as messages. Empty means valid.
 *
 * Returned rather than thrown so a test can assert on the reason. Field
 * presence and unknown ids are checked by the caller alongside the equivalent
 * checks for edges; what lives here is the part that is specific to what a
 * transfer means.
 */
export function checkTransfers(all: Polity[], edges: Edge[], transfers: Transfer[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const t of transfers) {
    const loser = all.find((p) => p.id === t.from)
    const taker = all.find((p) => p.id === t.to)
    if (!loser || !taker) continue // unknown ids are the caller's error to report

    if (t.from === t.to) {
      problems.push(`${t.from}: a polity cannot take territory from itself`)
      continue
    }

    // Coding rule 10.1, and the line between this file and edges.yaml. A
    // polity that did not survive the loss was conquered, and conquest is a
    // succession claim that a region's thread is entitled to draw. Recording
    // it here instead would hide a real edge from the thread, which is the one
    // way this file could do actual damage.
    if (t.year !== null && loser.span.end.max <= t.year) {
      problems.push(
        `${t.from} -> ${t.to}: ${t.from} ends in ${loser.span.end.max}, at or before this ` +
          `transfer in ${t.year} — a polity that did not survive was conquered, and conquest ` +
          'is an edge',
      )
    }

    // Both parties have to have existed at the time. A transfer dated outside
    // the taker's span is either a wrong year or the wrong polity, and both
    // are the kind of mistake that reads perfectly well on the page.
    if (t.year !== null && (t.year < taker.span.start.min || t.year > taker.span.end.max)) {
      problems.push(
        `${t.from} -> ${t.to}: ${t.to} did not exist in ${t.year} ` +
          `(${taker.span.start.min}-${taker.span.end.max})`,
      )
    }
    if (t.year !== null && t.year < loser.span.start.min) {
      problems.push(
        `${t.from} -> ${t.to}: ${t.from} did not exist in ${t.year} ` +
          `(from ${loser.span.start.min})`,
      )
    }

    // A pair may transfer territory more than once — Byzantium lost Sicily and
    // then Anatolia to different powers, and could lose two regions to the
    // same one — so the identity of a transfer includes what moved.
    const key = `${t.from}|${t.to}|${t.what}`
    if (seen.has(key)) problems.push(`duplicate transfer ${key}`)
    seen.add(key)
  }

  // A transfer must not restate an edge already recorded between the same pair
  // in the same direction. Where both exist the edge is the stronger claim and
  // the transfer is redundant at best; at worst the page says a polity was
  // both succeeded by and merely diminished by the same neighbour.
  const edgeKeys = new Set(edges.map((e) => `${e.from}|${e.to}`))
  for (const t of transfers) {
    if (edgeKeys.has(`${t.from}|${t.to}`)) {
      problems.push(
        `${t.from} -> ${t.to}: an edge already records this pair in this direction — ` +
          'succession is the stronger claim and the transfer is redundant',
      )
    }
  }

  return problems
}
