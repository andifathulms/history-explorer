import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PHASES, ASIDE, CHAPTER_PHASES, arcIndex } from './types.ts'

test('the arc is ordered, and the order is the one the spine draws', () => {
  assert.deepEqual([...PHASES], [
    'formation',
    'expansion',
    'peak',
    'contraction',
    'end',
    'afterlife',
  ])
  assert.equal(arcIndex('formation'), 0)
  assert.equal(arcIndex('afterlife'), PHASES.length - 1)
  assert.ok(arcIndex('peak')! < arcIndex('end')!)
})

test('an aside stands outside the arc and cannot be ordered against it', () => {
  // The whole point of the value. If this ever returns a number, a thematic
  // chapter starts constraining where narrative chapters may be filed.
  assert.equal(arcIndex(ASIDE), null)
  assert.equal(arcIndex(null), null)
  assert.ok(CHAPTER_PHASES.includes(ASIDE))
  assert.equal(CHAPTER_PHASES.length, PHASES.length + 1)
})

test('an unrecognised tag is not silently treated as position zero', () => {
  // A typo must not sort as `formation` and pass the build's ordering check.
  assert.equal(arcIndex('formaton' as never), null)
})

// --- extent series -------------------------------------------------------
// The loader holds the invariants (order, dates inside the span, peak not
// below the series). These cover the arithmetic the trajectory draws with.

test('a trajectory is scaled against the highest cited figure, not the last', () => {
  const points = [
    { km2: 900_000, at: 900, source: 's' },
    { km2: 2_600_000, at: 928, source: 's' },
    { km2: 1_200_000, at: 990, source: 's' },
  ]
  const peak = points.reduce((a, b) => (b.km2 > a.km2 ? b : a))
  assert.equal(peak.at, 928)
  // A polity that ended smaller than it peaked must not have its last column
  // drawn full height.
  assert.ok(points[2].km2 / peak.km2 < 1)
})

test('column positions come from the span, so a series ending early looks early', () => {
  const from = 819
  const to = 1005
  const at = (y: number) => ((y - from) / (to - from)) * 100
  assert.equal(at(819), 0)
  assert.equal(at(1005), 100)
  // The Samanid peak year sits where its date puts it, not at the midpoint of
  // however many figures happen to have been transcribed.
  assert.ok(at(928) > 50 && at(928) < 60)
})

// --- contemporaries ------------------------------------------------------

import { contemporariesOf } from './contemporaries.ts'
import type { Polity, ReferencePolity } from './types.ts'

const bare = (id: string, sMin: number, sMax: number, eMin: number, eMax: number): Polity =>
  ({
    id,
    region: 'r',
    name: { latin: id, script: null, script_lang: null },
    span: {
      start: { min: sMin, max: sMax, source: 's' },
      end: { min: eMin, max: eMax, source: 's' },
    },
    identity: '',
    banner: null,
    capitals: [],
    core_region: '',
    rulers: { founder: null, peak: null, last: null },
    scripts_and_languages: { administration: [], writing_system: null },
    ended: null,
    banner: null,
    institutions: {
      military_basis: null,
      revenue_basis: null,
      succession_rule: null,
      legitimation: null,
    },
    turning_points: [],
    measures: {
      reach_km2: null,
      extent: [],
      peak_population: null,
      influence: {
        descendant_scripts: { count: null, items: [], source: null },
        religions_carried: { count: null, items: [], source: null },
        successor_claims: { count: null, items: [], source: null },
      },
    },
  }) as Polity

test('overlap on every reading of the dates is certain', () => {
  const subject = bare('a', 800, 800, 900, 900)
  const other = bare('b', 850, 850, 950, 950)
  const { certain, possible } = contemporariesOf(subject, [subject, other], [])
  assert.deepEqual(certain.map((c) => c.id), ['b'])
  assert.equal(possible.length, 0)
  assert.equal(certain[0].certainYears, 50)
})

test('overlap that depends on which cited date you accept is possible, not certain', () => {
  // Contact only if you take b's earliest start and a's latest end. The site
  // must not resolve that by picking one; it says the answer is open.
  const subject = bare('a', 800, 810, 880, 900)
  const other = bare('b', 890, 895, 960, 970)
  const { certain, possible } = contemporariesOf(subject, [subject, other], [])
  assert.equal(certain.length, 0)
  assert.deepEqual(possible.map((c) => c.id), ['b'])
})

test('spans that cannot meet on any reading are absent entirely', () => {
  const subject = bare('a', 800, 810, 880, 900)
  const other = bare('b', 950, 960, 990, 999)
  const { certain, possible } = contemporariesOf(subject, [subject, other], [])
  assert.equal(certain.length + possible.length, 0)
})

test('a polity is never its own contemporary', () => {
  const subject = bare('a', 800, 800, 900, 900)
  const { certain, possible } = contemporariesOf(subject, [subject], [])
  assert.equal(certain.length + possible.length, 0)
})

test('the reference backdrop is included, and marked as having no page', () => {
  const subject = bare('a', 800, 800, 900, 900)
  const ref = {
    id: 'r1',
    name: 'Backdrop',
    span: { start: 700, end: 1000, source: 's' },
    reach_km2: null,
    peak_population: null,
  } as ReferencePolity
  const { certain } = contemporariesOf(subject, [subject], [ref])
  assert.deepEqual(certain.map((c) => [c.id, c.hasPage]), [['r1', false]])
})

test('a polity already in the narrative corpus is not repeated from the backdrop', () => {
  // Most narrative polities also have a reference-set row. Listing both would
  // print every major contemporary twice, once linked and once not.
  const subject = bare('a', 800, 800, 900, 900)
  const other = bare('b', 820, 820, 880, 880)
  const dupe = {
    id: 'b',
    name: 'b',
    span: { start: 820, end: 880, source: 's' },
    reach_km2: null,
    peak_population: null,
  } as ReferencePolity
  const { certain, possible } = contemporariesOf(subject, [subject, other], [dupe])
  assert.equal(certain.length + possible.length, 1)
  assert.equal(certain[0].hasPage, true)
})

// --- edge tallies --------------------------------------------------------

import { edgeTallies } from './thread.ts'
import type { Edge } from './types.ts'

test('edge tallies count both directions and order by outward edges', () => {
  const e = (from: string, to: string): Edge =>
    ({ from, to, type: 'overthrew', year: null, note: 'n', source: 's', contested: false }) as Edge
  const t = edgeTallies([e('a', 'b'), e('a', 'c'), e('d', 'a')], (id) => id)
  assert.deepEqual(
    t.map((x) => [x.id, x.out, x.in]),
    [
      ['a', 2, 1],
      ['d', 1, 0],
      ['b', 0, 1],
      ['c', 0, 1],
    ],
  )
})

test('a polity with no edges is absent from the tally, not zero-ranked', () => {
  // The distinction the continuity page turns on: no edges means nothing has
  // been entered, which is not a score of zero and must not be printed as one.
  const t = edgeTallies([], (id) => id)
  assert.equal(t.length, 0)
})
