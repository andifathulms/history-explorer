# CLAUDE.md

Build instructions for this repository. Read PRD.md and DESIGN.md first.

## What this is

**History Explorer** — a static reading site about polities. Several sections
over one corpus: polity pages, rankings, continuity (succession), timeline.

The one framing mistake to avoid: **continuity is one section, not the spine.**
Succession is a property some polities have. Rome and Srivijaya will enter with
no sourced edge to anything already here and must be first-class anyway — full
pages, full rankings, no thread. Never write code, copy, or a data rule that
treats an edgeless polity as incomplete.

## Stack

- Next.js 14, App Router, `output: 'export'` — fully static
- Tailwind CSS
- D3 for the map and the succession graph
- MDX for chapters
- Deploys to GitHub Pages. **No backend, no database, no API routes, no server
  components that fetch at runtime.** All content ships in the bundle.

## Repository layout

```
/content
  regions.yaml           # browsing groups; each says whether it carries a thread
  /polities
    samanid/
      polity.yaml        # facts, measures, sources
      01-rise.mdx        # chapters, ordered by filename
      02-bukhara.mdx
      ...
  edges.yaml             # every succession edge
  reference-set.yaml     # ~50 backdrop polities, numbers only
  sources.yaml           # every source, cited by id
  coding-rules.md        # the influence rulebook
/data
  /basemaps              # trimmed historical-basemaps GeoJSON snapshots
/lib
  ratings.ts             # percentile + weighting maths
  gaps.ts                # missing-data handling
  content.ts             # build-time loading and rule enforcement
```

## Routes

```
/                      hub — section cards and counts. Draws no thread.
/polities/             the reading core, grouped by region
/polity/<id>/          one polity
/rankings/             ranked table, reader sliders, global percentiles
/continuity/           threads by region, plus the edge vocabulary
/continuity/<region>/  one region's thread
/timeline/             spans on one axis
/about/                method, limits, sources
```

Adding a section should be a new route over the existing corpus, not a
migration.

## Data model

### regions.yaml

```yaml
regions:
  - id: iranian-intermezzo
    name: The Iranian Intermezzo
    blurb: >-
      The Persianate dynasties between the fading of direct Abbasid rule and
      the Mongol arrival.
    thread: true     # false is ordinary — see hard rule 7
```

### polity.yaml

```yaml
id: samanid
region: iranian-intermezzo
name:
  latin: Samanid Empire
  script: سامانیان
  script_lang: fa
span:
  start: { min: 819, max: 819, source: bosworth-1996 }
  end:   { min: 999, max: 1005, source: iranica-samanids }
identity: "Persian dynasty ruling Khurasan and Transoxiana from Bukhara."
capitals:
  - { name: Bukhara, from: 892, source: iranica-samanids }
core_region: Transoxiana and Khurasan
rulers:                    # exactly three, never a dynasty list
  founder:   { name: Saman Khuda, source: ... }
  peak:      { name: Nasr II, reign: [914, 943], source: ... }
  last:      { name: Isma'il Muntasir, source: ... }
scripts_and_languages:
  administration: [Persian, Arabic]
  writing_system: Perso-Arabic
ended:
  type: conquest           # closed vocabulary — see PRD §5
  by: [karakhanid, ghaznavid]
  year: 999
  source: ...
measures:
  reach_km2:      { value: 2600000, at: 928, source: taagepera-1997 }
  peak_population: null    # see gap rules below
  influence:
    descendant_scripts:  { count: 0, items: [], source: ... }
    religions_carried:   { count: 1, items: [Sunni Islam], source: ... }
    successor_claims:    { count: 2, items: [ghaznavid, karakhanid], source: ... }
```

### edges.yaml

```yaml
- from: samanid
  to: ghaznavid
  type: slave-general of
  year: 962
  note: "Alptigin, a Samanid Turkic slave-general, seized Ghazna and founded
         a line that outlasted his masters."
  source: bosworth-1963
  contested: false
```

Edges are optional. A polity with none is complete.

## Hard rules

These are not style preferences. Breaking them breaks the product.

1. **Never invent a citation.** Not a plausible-looking one, not a
   "representative" one, not a placeholder to fill in later. Every `source` field
   must point to an id in `sources.yaml` that corresponds to a real work the
   author can open. If you do not have a source, the value is `null` and the gap
   is rendered.

2. **Never estimate a number.** No interpolation, no "approximately", no
   averaging two sources into one figure. If two sources disagree, store both as
   a `{ min, max }` with both source ids and render the range.

3. **`null` renders as "No cited figure", never as zero.** A missing axis is
   excluded from weighted totals, and the total states how many axes it was
   computed from. A polity with two of four axes must never appear to score
   lower than one with four.

4. **Every chapter names its source.** MDX frontmatter requires `drafted_from`
   with a source id. A chapter without one does not render.

5. **Do not reconcile map polygons with cited extent figures.** They will
   disagree. That is expected and correct. Never compute km² from a polygon and
   present it as a measure.

6. **Influence is never a single number.** Three counts, shown separately. Only
   the reader's slider may combine them, and only in their own view.

7. **A polity never requires an edge, and threads never cross regions.** No
   succession is an ordinary state, rendered as one plain sentence, never as a
   gap or a pending item. A thread draws only edges with both ends inside its own
   region — a global thread would assert a sequence nobody cited. `thread: true`
   on a region with no internal edge fails the build.

8. **Rankings include every polity.** Threaded or not, region or none.
   Measurement does not require a predecessor.

## Ratings maths (`lib/ratings.ts`)

- Percentile is computed over narrative corpus ∪ reference set, across all
  regions, per axis, on whichever scale is active (absolute or era-normalized).
- Era-normalized reach = peak km² ÷ estimated world land under state control at
  that date; era-normalized population = peak population ÷ world population at
  that date. Both denominators come from cited sources and live in
  `reference-set.yaml`. If a denominator is missing for a date, era-normalized
  mode shows a gap for that polity rather than falling back to absolute.
- Weighted total renormalizes across available axes only.
- Reader weights serialize to the URL query string.

## Influence coding rulebook

`content/coding-rules.md` is written and binding. Read it before entering any
influence data, and follow it uniformly. It answers:

- What counts as a **successor claim**? Titulature only (Ottoman *Kayser-i Rûm*),
  or does dynastic descent count? Does an unrecognised claim count the same as a
  recognised one?
- What counts as a **religion carried**? Adoption by the polity, or active
  propagation beyond its borders?
- What counts as a **descendant script**? Direct derivation only, or adaptation
  of an existing script to a new language?

Without this file the counts are opinions wearing a number. Apply the same rules
to all polities, including ones where the answer is inconvenient — and including
ones in regions added later, where the temptation to bend a definition to fit an
unfamiliar case will be strongest.

## Content workflow

One polity at a time. Open the named source, draft chapters against it, fill
`polity.yaml` from it, then move on. Do not draft several polities in one pass
from general knowledge — that is exactly how unsourced claims enter.

Adding a region: write the region into `regions.yaml` with `thread: false`, add
its polities one at a time, and flip `thread: true` only once real sourced edges
join two of them. Do not add a region and its thread in the same pass.

A backdrop entry in `reference-set.yaml` is not a stub. Promoting one to a full
polity means opening a source and writing chapters like any other.

## Quality floor

Responsive to mobile. Visible keyboard focus. `prefers-reduced-motion`
respected. Long-form text readable at 100% zoom without horizontal scroll.
