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
 *
 * Three surfaces beyond chapter prose render on the page and carry the same
 * risk, and for a long stretch none of them were checked at all: `identity`
 * and each turning point's `changed` in every polity.yaml, and `note` on every
 * edge in edges.yaml. All three are scanned here now, because the violations
 * that turn up there are invisible to a reader only in the sense that nobody
 * had gone looking — they render on the page exactly like chapter prose does.
 * `components/` strings are still a manual-review surface: shared UI chrome
 * isn't polity narrative, and repeats on every page, so it needs eyes rather
 * than a regex written for one voice.
 */

import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'

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
  'span\\.end',
  'span\\.start',
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
    id: 'code-span',
    // A backtick in reader prose is never a citation, a quote or emphasis —
    // this corpus uses italics and blockquotes for those. Every instance
    // found while auditing was a coded value or field name styled as code:
    // `conquest`, `appanage`, `span.end`, a chapter's own `peak` tag. Flag the
    // formatting itself rather than trying to keep the term list exhaustive.
    re: /`[^`\n]+`/g,
    say: 'uses inline code formatting for a data value in prose',
  },
  {
    id: 'self-reference',
    // "This record's army", "this page completes", "this chapter is tagged"
    // — the polity has a name and the chapter is about the past, not itself.
    re: /\bthis (record|page|entry|chapter)('s)?\b/gi,
    say: 'calls the polity "this record" instead of naming it',
  },
  {
    id: 'corpus-talk',
    // "site" alone is not safe to broaden to a bare "the site": across this
    // corpus's own archaeology-heavy chapters "the site" overwhelmingly means
    // an actual excavation (Great Zimbabwe, Hattusa, Nineveh), not the
    // collection. "this site" carries no such ambiguity — nothing in the
    // corpus uses it to mean "this settlement" — so only that form, and
    // "for/left for the site" (found on audit, distinct from "dug the site"
    // in kind: nothing is dug "for" a place), are flagged.
    re: /\b(this|the) corpus('s)?\b|\bthis site('s)?\b|\b(for|left for) the site\b|\bthe site (records|codes|carries|reads|types|cannot|does not|is coded|ranks)\b|\bthe dataset\b|\b(a pass ago|this pass)\b/gi,
    say: 'talks about the corpus rather than the past',
  },
]

/** Collapse newlines and repeated whitespace to single spaces before matching,
 * so a banned phrase split across a source line-wrap (a YAML block scalar's
 * own line breaks, or hard-wrapped chapter prose) still reads as one phrase
 * the way it will once rendered. This is the single biggest source of missed
 * violations found on manual audit — "This site's" split as "This\nsite's". */
function flatten(text) {
  return text.replace(/\s+/g, ' ')
}

function violations(text) {
  const flat = flatten(text)
  const found = []
  for (const rule of RULES) {
    const hits = flat.match(rule.re)
    if (hits) found.push({ id: rule.id, say: rule.say, count: hits.length })
  }
  return found
}

/** Frontmatter is machinery by definition and is not prose. */
function chapterBody(text) {
  const m = text.match(/^---\n[\s\S]*?\n---\n/)
  return m ? text.slice(m[0].length) : text
}

function polityDirs() {
  return fs
    .readdirSync(path.join(ROOT, CHAPTERS))
    .filter((d) => fs.statSync(path.join(ROOT, CHAPTERS, d)).isDirectory())
    .sort()
}

function chapterFiles() {
  const out = []
  for (const dir of polityDirs()) {
    const full = path.join(ROOT, CHAPTERS, dir)
    for (const f of fs.readdirSync(full)) {
      if (f.endsWith('.mdx')) out.push(`${CHAPTERS}/${dir}/${f}`)
    }
  }
  return out.sort()
}

/** Reader-facing string fields inside one polity.yaml: identity, and each
 * turning point's, external neighbour's, and resumption note's own prose. */
function polityYamlSurfaces(rel) {
  const full = path.join(ROOT, rel)
  let doc
  try {
    doc = parseYaml(fs.readFileSync(full, 'utf8'))
  } catch {
    return []
  }
  if (!doc || typeof doc !== 'object') return []

  const surfaces = []
  if (typeof doc.identity === 'string') {
    surfaces.push({ label: 'identity', text: doc.identity })
  }
  for (const tp of doc.turning_points ?? []) {
    if (typeof tp?.changed === 'string') {
      surfaces.push({ label: `turning_point "${tp.name ?? '?'}"`, text: tp.changed })
    }
  }
  for (const key of ['preceded_by_external', 'succeeded_by_external']) {
    for (const item of doc[key] ?? []) {
      if (typeof item?.note === 'string') {
        surfaces.push({ label: `${key} "${item.name ?? '?'}"`, text: item.note })
      }
    }
  }
  return surfaces
}

function edgeSurfaces() {
  const full = path.join(ROOT, 'content/edges.yaml')
  if (!fs.existsSync(full)) return []
  let doc
  try {
    doc = parseYaml(fs.readFileSync(full, 'utf8'))
  } catch {
    return []
  }
  const edges = doc?.edges ?? []
  const out = []
  for (const e of edges) {
    if (typeof e?.note === 'string') {
      out.push({ file: 'content/edges.yaml', label: `edge ${e.from} -> ${e.to}`, text: e.note })
    }
  }
  return out
}

const chapterList = chapterFiles()
const failures = []

for (const f of chapterList) {
  const found = violations(chapterBody(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  if (found.length) failures.push({ f, found })
}

let polityYamlCount = 0
for (const dir of polityDirs()) {
  const rel = `${CHAPTERS}/${dir}/polity.yaml`
  if (!fs.existsSync(path.join(ROOT, rel))) continue
  polityYamlCount++
  for (const { label, text } of polityYamlSurfaces(rel)) {
    const found = violations(text)
    if (found.length) failures.push({ f: `${rel} (${label})`, found })
  }
}

const edgeItems = edgeSurfaces()
for (const { file, label, text } of edgeItems) {
  const found = violations(text)
  if (found.length) failures.push({ f: `${file} (${label})`, found })
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

console.log(
  `voice: ok — ${chapterList.length}/${chapterList.length} chapters, ` +
    `${polityYamlCount} polity.yaml files, ${edgeItems.length} edge notes reader-facing`,
)
