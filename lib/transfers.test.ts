/**
 * The rules that keep transfers.yaml from becoming a second edges.yaml.
 *
 * Both failure modes this guards are quiet ones: a conquest filed here would
 * vanish from the thread that is supposed to draw it, and a file with no
 * threshold would fill with frontier skirmishes until it said nothing.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkTransfers, transfersOf } from './transfers.ts'
import type { Edge, Polity, Transfer } from './types.ts'

const polity = (id: string, start: number, end: number): Polity =>
  ({ id, span: { start: { min: start, max: start }, end: { min: end, max: end } } }) as Polity

const transfer = (from: string, to: string, year: number | null, what = 'a province'): Transfer =>
  ({ from, to, what, year, note: 'n', source: 's', contested: false }) as Transfer

const BYZ = polity('byzantine', 395, 1453)
const RASH = polity('rashidun', 632, 661)
const SELJ = polity('great-seljuk', 1037, 1194)
const ALL = [BYZ, RASH, SELJ]

test('a loss the polity survived is exactly what this file is for', () => {
  const t = transfer('byzantine', 'rashidun', 642, 'Syria, Palestine and Egypt')
  assert.deepEqual(checkTransfers(ALL, [], [t]), [])
})

test('a transfer that killed the loser is a conquest, and conquest is an edge', () => {
  // The load-bearing rule. Without it this file is a way to record a conquest
  // while keeping it out of the region's thread, which is the one assertion
  // hard rule 7 exists to make visible.
  const problems = checkTransfers(ALL, [], [transfer('rashidun', 'byzantine', 661)])
  assert.equal(problems.length, 1)
  assert.match(problems[0], /conquered, and conquest is an edge/)
})

test('the boundary is inclusive: a transfer dated to the loser’s last year fails', () => {
  assert.equal(checkTransfers(ALL, [], [transfer('rashidun', 'byzantine', 660)]).length, 0)
  assert.equal(checkTransfers(ALL, [], [transfer('rashidun', 'byzantine', 661)]).length, 1)
})

test('both parties must have existed on the date given', () => {
  // Byzantium lost Anatolia to the Seljuks, but not in 642 — they did not exist.
  const problems = checkTransfers(ALL, [], [transfer('byzantine', 'great-seljuk', 642)])
  assert.equal(problems.length, 1)
  assert.match(problems[0], /great-seljuk did not exist in 642/)
})

test('an edge in the same direction wins, and the transfer is refused', () => {
  // Succession is the stronger claim. A page must never say a neighbour both
  // succeeded this polity and merely took a province from it.
  const edge = { from: 'byzantine', to: 'rashidun', type: 'conquered by' } as Edge
  const t = transfer('byzantine', 'rashidun', 642)
  const problems = checkTransfers(ALL, [edge], [t])
  assert.ok(problems.some((p) => /succession is the stronger claim/.test(p)))
})

test('a pair may transfer twice, but not the same territory twice', () => {
  const a = transfer('byzantine', 'rashidun', 636, 'Syria')
  const b = transfer('byzantine', 'rashidun', 642, 'Egypt')
  assert.deepEqual(checkTransfers(ALL, [], [a, b]), [])
  const dup = transfer('byzantine', 'rashidun', 642, 'Syria')
  assert.ok(checkTransfers(ALL, [], [a, dup]).some((p) => /duplicate transfer/.test(p)))
})

test('transfersOf reads both directions and mixes neither', () => {
  const lost = transfer('byzantine', 'rashidun', 642, 'Egypt')
  const gained = transfer('great-seljuk', 'byzantine', 1100, 'a coastal strip')
  const v = transfersOf([lost, gained], 'byzantine')
  assert.deepEqual(v.lost, [lost])
  assert.deepEqual(v.gained, [gained])
})
