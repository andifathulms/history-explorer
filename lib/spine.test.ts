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
