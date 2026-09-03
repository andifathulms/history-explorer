# CLAUDE.md

Build instructions for this repository. Read PRD.md and DESIGN.md first.

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
  /polities
    samanid/
      polity.yaml        # facts, measures, sources
      01-rise.mdx        # chapters, ordered by filename
      02-bukhara.mdx
      ...
  edges.yaml             # every succession edge
  reference-set.yaml     # ~50 backdrop polities, numbers only
  sources.yaml           # every source, cited by id
/data
  /basemaps              # trimmed historical-basemaps GeoJSON snapshots
/lib
  ratings.ts             # percentile + weighting maths
  gaps.ts                # missing-data handling
```

## Data model

### polity.yaml

```yaml
id: samanid
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
  type: conquest           # closed vocabulary — see PRD §4
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

## Ratings maths (`lib/ratings.ts`)

- Percentile is computed over narrative corpus ∪ reference set, per axis, on
  whichever scale is active (absolute or era-normalized).
- Era-normalized reach = peak km² ÷ estimated world land under state control at
  that date; era-normalized population = peak population ÷ world population at
  that date. Both denominators come from cited sources and live in
  `reference-set.yaml`. If a denominator is missing for a date, era-normalized
  mode shows a gap for that polity rather than falling back to absolute.
- Weighted total renormalizes across available axes only.
- Reader weights serialize to the URL query string.

## Influence coding rulebook

Write `content/coding-rules.md` before entering any influence data, and follow it
uniformly. It must answer at minimum:

- What counts as a **successor claim**? Titulature only (Ottoman *Kayser-i Rûm*),
  or does dynastic descent count? Does an unrecognised claim count the same as a
  recognised one?
- What counts as a **religion carried**? Adoption by the polity, or active
  propagation beyond its borders?
- What counts as a **descendant script**? Direct derivation only, or adaptation
  of an existing script to a new language?

Without this file the counts are opinions wearing a number. Apply the same rules
to all polities, including ones where the answer is inconvenient.

## Content workflow

One polity at a time. Open the named source, draft chapters against it, fill
`polity.yaml` from it, then move on. Do not draft several polities in one pass
from general knowledge — that is exactly how unsourced claims enter.

## Quality floor

Responsive to mobile. Visible keyboard focus. `prefers-reduced-motion`
respected. Long-form text readable at 100% zoom without horizontal scroll.
