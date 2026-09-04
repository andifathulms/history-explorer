/**
 * Run with: npm test
 *
 * These guard the two properties the PRD states as requirements rather than
 * preferences. If either breaks, the app is publishing a false comparison.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildField,
  rate,
  percentile,
  duration,
  weightsToQuery,
  weightsFromQuery,
  logMagnitude,
  sortForBoard,
  type Rating,
  ordinal,
  DEFAULT_WEIGHTS,
  reachValue,
} from './ratings.ts'
import { isPresent, renormalise, gap, value } from './gaps.ts'
import type { Polity, WorldDenominator } from './types.ts'

const blankInfluence = {
  descendant_scripts: { count: null, items: [], source: null },
  religions_carried: { count: null, items: [], source: null },
  successor_claims: { count: null, items: [], source: null },
}

function polity(over: Partial<Polity> & { id: string }): Polity {
  return {
    name: { latin: over.id, script: null, script_lang: null },
    span: {
      start: { min: 900, max: 900, source: 's' },
      end: { min: 1000, max: 1000, source: 's' },
    },
    identity: '',
    capitals: [],
    core_region: '',
    rulers: { founder: null, peak: null, last: null },
    scripts_and_languages: { administration: [], writing_system: null },
    ended: null,
    measures: { reach_km2: null, extent: [], peak_population: null, influence: blankInfluence },
    ...over,
  } as Polity
}

const denominators: WorldDenominator[] = [
  {
    year: 1000,
    world_population: { value: 265_000_000, source: 'mcevedy-jones-1978' },
    world_land_under_state_control_km2: null,
  },
]

test('a polity missing two axes does not score below one with four', () => {
  // Documented on every axis it has, but modestly. Four axes available.
  const documented = polity({
    id: 'documented',
    measures: {
      reach_km2: { value: 1_000_000, at: 1000, source: 's' },
      extent: [],
      peak_population: { value: 5_000_000, at: 1000, source: 's' },
      influence: {
        descendant_scripts: { count: 0, items: [], source: 's' },
        religions_carried: { count: 0, items: [], source: 's' },
        successor_claims: { count: 0, items: [], source: 's' },
      },
    },
  })
  // Enormous where it is documented, silent elsewhere. Two axes available.
  const sparse = polity({
    id: 'sparse',
    measures: {
      reach_km2: { value: 9_000_000, at: 1000, source: 's' },
      extent: [],
      peak_population: null,
      influence: blankInfluence,
    },
  })

  const corpus = [documented, sparse]
  const field = buildField(corpus, [], 'absolute', denominators)
  const a = rate(documented, field, DEFAULT_WEIGHTS, 'absolute', denominators)
  const b = rate(sparse, field, DEFAULT_WEIGHTS, 'absolute', denominators)

  assert.equal(a.axesAvailable, 4)
  assert.equal(b.axesAvailable, 2)
  assert.ok(isPresent(a.total) && isPresent(b.total))
  assert.ok(
    isPresent(b.total) && isPresent(a.total) && b.total.value > a.total.value,
    'the sparse polity leads on the axis it has, so it must not be dragged below by its gaps',
  )
})

test('a missing axis is excluded from the total, never counted as zero', () => {
  const p = polity({
    id: 'p',
    measures: {
      reach_km2: { value: 2_000_000, at: 1000, source: 's' },
      extent: [],
      peak_population: null,
      influence: blankInfluence,
    },
  })
  const field = buildField([p], [], 'absolute', denominators)
  const r = rate(p, field, DEFAULT_WEIGHTS, 'absolute', denominators)
  // Sole member of the field, so reach and longevity both sit at the 50th.
  // A zero-filled demographic or influence axis would pull the total under it.
  assert.ok(isPresent(r.total))
  assert.equal(isPresent(r.total) ? Math.round(r.total.value * 100) : -1, 50)
  assert.equal(r.totalProvenance, 'computed from 2 of 4 axes')
})

test('era-normalised gaps rather than falling back to the absolute figure', () => {
  const p = polity({
    id: 'p',
    measures: {
      reach_km2: { value: 2_600_000, at: 1000, source: 's' },
      extent: [],
      peak_population: null,
      influence: blankInfluence,
    },
  })
  // No land denominator is cited for any year, so reach must gap.
  const era = reachValue(p, 'era-normalised', denominators)
  assert.equal(era.present, false)
  assert.equal(era.present === false ? era.reason : '', 'no-denominator')

  const abs = reachValue(p, 'absolute', denominators)
  assert.ok(isPresent(abs) && abs.value === 2_600_000)
})

test('longevity keeps both ends of a contested span', () => {
  const p = polity({
    id: 'p',
    span: {
      start: { min: 819, max: 819, source: 's' },
      end: { min: 999, max: 1005, source: 's' },
    },
  })
  assert.deepEqual(duration(p), { min: 180, max: 186 })
})

test('renormalise refuses to invent a total when nothing is present', () => {
  assert.equal(renormalise([1, 1, 1], [false, false, false]), null)
  assert.deepEqual(renormalise([1, 1, 2], [true, false, true]), [1 / 3, 0, 2 / 3])
})

test('ties percentile identically', () => {
  assert.equal(percentile(5, [5, 5, 5, 5]), 0.5)
  assert.equal(percentile(9, [1, 2, 3]), 1)
  assert.equal(percentile(0, [1, 2, 3]), 0)
})

test('reader weights survive a round trip through the query string', () => {
  const w = {
    ...DEFAULT_WEIGHTS,
    reach: 0.7,
    longevity: 0.1,
    demographic: 0.1,
    influence: 0.1,
    influenceMix: { scripts: 0.25, religions: 0.5, claims: 1 },
  }
  const back = weightsFromQuery(weightsToQuery(w, 'era-normalised'))
  assert.equal(back.scale, 'era-normalised')
  assert.equal(back.weights.reach, 0.7)
  assert.equal(back.weights.influenceMix.religions, 0.5)
})

/**
 * The table printed "81th" and "1th" for a year and nobody caught it. On a site
 * whose whole claim is that its numbers were handled carefully, the suffix is
 * not cosmetic.
 */
test('ordinal suffixes, including the teens the naive rule misses', () => {
  assert.equal(ordinal(1), '1st')
  assert.equal(ordinal(2), '2nd')
  assert.equal(ordinal(3), '3rd')
  assert.equal(ordinal(4), '4th')
  assert.equal(ordinal(11), '11th')
  assert.equal(ordinal(12), '12th')
  assert.equal(ordinal(13), '13th')
  assert.equal(ordinal(21), '21st')
  assert.equal(ordinal(42), '42nd')
  assert.equal(ordinal(83), '83rd')
  assert.equal(ordinal(100), '100th')
  assert.equal(ordinal(111), '111th')
})

// --- normalisation and boards --------------------------------------------

test('log magnitude keeps the distance percentile throws away', () => {
  const field = [650_000, 2_600_000, 11_100_000, 35_500_000]
  const umayyad = logMagnitude(11_100_000, field)
  const mongol = logMagnitude(35_500_000, field)
  assert.ok(umayyad.present && mongol.present)
  // Under percentile these two sit one rank apart at the top of the field.
  // Under log magnitude the gap between them is visible and large.
  assert.ok(mongol.value - umayyad.value > 0.25)
  assert.equal(mongol.value, 1)
  const smallest = logMagnitude(650_000, field)
  assert.ok(smallest.present && smallest.value === 0)
})

test('log magnitude gaps rather than inventing a floor', () => {
  // A count of zero has no logarithm, and a field with no spread has no scale.
  assert.equal(logMagnitude(0, [1, 10]).present, false)
  assert.equal(logMagnitude(-5, [1, 10]).present, false)
  assert.equal(logMagnitude(5, [5, 5]).present, false)
  assert.equal(logMagnitude(5, []).present, false)
})

test('a board separates unrankable rows from the ranking rather than sorting them last', () => {
  const mk = (id: string, reach: number | null): Rating =>
    ({
      polity: { id, latin: id, script: null },
      reach: { id: 'reach', label: '', raw: reach === null ? gap() : value(reach), pct: gap() },
      longevity: { id: 'longevity', label: '', years: { min: 10, max: 10 }, pct: { min: gap(), max: gap() } },
      demographic: { id: 'demographic', label: '', raw: gap(), pct: gap() },
      influence: { id: 'influence', label: '', counts: {} as never, readerFused: gap() },
      intensity: { perYear: gap() },
      total: gap(),
      totalProvenance: '',
      axesAvailable: 0,
      axesTotal: 4,
    }) as unknown as Rating

  const { ranked, unranked } = sortForBoard(
    [mk('small', 1000), mk('uncited', null), mk('big', 9000)],
    'size',
  )
  assert.deepEqual(ranked.map((r) => r.polity.id), ['big', 'small'])
  // The point of the split: "no cited extent" must not read as "smallest".
  assert.deepEqual(unranked.map((r) => r.polity.id), ['uncited'])
})

test('the whole view round-trips through the query string', () => {
  const qs = weightsToQuery(DEFAULT_WEIGHTS, 'era-normalised', 'log-magnitude', 'endurance')
  const back = weightsFromQuery(qs)
  assert.equal(back.scale, 'era-normalised')
  assert.equal(back.normalisation, 'log-magnitude')
  assert.equal(back.board, 'endurance')
})

test('an unknown board in a link falls back rather than rendering nothing', () => {
  assert.equal(weightsFromQuery('board=greatest').board, 'overall')
})
