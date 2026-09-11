/**
 * Hard rule 11, enforced: a chapter is addressed to a reader, never to the
 * schema.
 *
 * The corpus drifted into writing about itself. Agents drafting record by
 * record wrote down what they were doing to the dataset as though that were the
 * story, so a Pajang chapter opened "This record exists because another one
 * asked for it" and a Srivijaya chapter interrupted the oldest dated text in
 * Malay to report that `descendant_scripts` was null and that coding rule 3 had
 * no value for a trade vernacular. Every sentence of that is true. None of it is
 * addressed to anybody reading about Java or Sumatra.
 *
 * What is deliberately NOT flagged: prose about sources, manuscripts, evidence
 * and what is not known. A chapter arguing that Srivijaya is visible only in
 * other people's sources is history — the record as evidence is a legitimate
 * subject, and `aside` exists for it. What is flagged is this repository's own
 * machinery: its field names, its vocabularies, its rulebook, and the habit of
 * calling a polity "this record".
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CHAPTERS = 'content/polities'

/** Schema fields and closed vocabularies. Naming one in prose is the tell. */
const SCHEMA_TERMS = [
  'revenue_basis',
  'military_basis',
  'succession_rule',
  'legitimation',
  'descendant_scripts',
  'religions_carried',
  'successor_claims',
  'reach_km2',
  'peak_population',
  'turning_points',
  'core_region',
  'context_only',
  'ended\\.by',
  'ended\\.type',
  'polity\\.yaml',
  'edges\\.yaml',
  'regions\\.yaml',
  'reference-set',
]

const RULES = [
  {
    id: 'coding-rule',
    // "coding rule 3 has no value for this" — the rulebook is for the author.
    re: /\b(coding|hard) rule\s+\d/gi,
    say: 'names the rulebook at the reader',
  },
  {
    id: 'schema-field',
    re: new RegExp(`\`?\\b(${SCHEMA_TERMS.join('|')})\\b\`?`, 'g'),
    say: 'names a schema field in prose',
  },
  {
    id: 'self-reference',
    // "This record's army", "this page completes" — the polity has a name.
    re: /\bthis (record|page|entry)('s)?\b/gi,
    say: 'calls the polity "this record" instead of naming it',
  },
  {
    id: 'corpus-talk',
    re: /\b(the|this) corpus\b|\bthis site('s)?\b|\bthe dataset\b|\b(a pass ago|this pass)\b/gi,
    say: 'talks about the corpus rather than the past',
  },
]

function chapterFiles() {
  const out = []
  for (const dir of fs.readdirSync(path.join(ROOT, CHAPTERS))) {
    const full = path.join(ROOT, CHAPTERS, dir)
    if (!fs.statSync(full).isDirectory()) continue
    for (const f of fs.readdirSync(full)) {
      if (f.endsWith('.mdx')) out.push(`${CHAPTERS}/${dir}/${f}`)
    }
  }
  return out.sort()
}

/** Frontmatter is machinery by definition and is not prose. */
function body(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n/)
  return m ? text.slice(m[0].length) : text
}

function violations(text) {
  const found = []
  for (const rule of RULES) {
    const hits = body(text).match(rule.re)
    if (hits) found.push({ id: rule.id, say: rule.say, count: hits.length })
  }
  return found
}

const files = chapterFiles()
const failures = []

for (const f of files) {
  const found = violations(fs.readFileSync(path.join(ROOT, f), 'utf8'))
  if (found.length) failures.push({ f, found })
}

if (failures.length) {
  console.error('\nvoice: a chapter addresses the schema instead of the reader.\n')
  for (const { f, found } of failures) {
    console.error(`  ${f}`)
    for (const v of found) console.error(`    ${v.count}x ${v.say} (${v.id})`)
  }
  console.error(
    '\nChapters are written for someone reading about the past. Field names,' +
      '\nvocabulary values and the coding rules are how this repository stores a' +
      '\nclaim, not how a claim is made to a reader. Name the polity, state what' +
      '\nhappened, and let the data carry the coding.\n',
  )
  process.exit(1)
}

console.log(`voice: ok — ${files.length}/${files.length} chapters reader-facing`)
