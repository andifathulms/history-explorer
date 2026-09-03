# Sambung

A read-only history site about how one polity becomes the next.

Wikipedia has an article on the Samanids and an article on the Ghaznavids. It
does not have the thing that connects them: Alptigin was a Samanid Turkic
slave-general who took Ghazna and founded a line that outlived his masters. That
pattern — secession, usurpation by generals, vassals swallowing overlords — is
the subject, and it lives in the edges between articles.

Eight polities, 819 to 1231, one continuous thread through one region.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to out/
npm test             # ratings invariants
npm run typecheck
```

Two content utilities:

```bash
npm run basemaps     # refetch and re-trim the historical-basemaps snapshots
npm run verify       # regenerate content/VERIFICATION.md
```

Fully static: no backend, no database, no API routes, nothing fetched at
runtime. `NEXT_PUBLIC_BASE_PATH` sets the base path for a GitHub Pages project
site; CI passes it automatically.

## Where things are

```
content/
  coding-rules.md       the influence rulebook — read this before touching counts
  sources.yaml          the closed set of citable works
  edges.yaml            the succession edges: the core object
  reference-set.yaml    51 backdrop polities, numbers only, plus denominators
  basemap-links.yaml    which snapshot polygon illustrates which polity
  VERIFICATION.md       generated worklist of every figure, unticked
  polities/<id>/
    polity.yaml         facts, measures, sources
    NN-slug.mdx         chapters, ordered by filename
lib/
  ratings.ts            percentile and weighting maths
  gaps.ts               missing-data handling
  content.ts            build-time loading and rule enforcement
  thread.ts             geometry of the thread
  basemap.ts            map polygons — deliberately cannot compute an area
data/basemaps/          trimmed snapshots (CC-BY-4.0)
```

## The rules the build enforces

These are not style preferences. Breaking them breaks the product, so
`next build` fails rather than rendering something plausible.

1. **No invented citations.** Every `source` resolves to an id in
   `sources.yaml`. A dangling id is worse than a visible gap: a gap is honest,
   and a dangling id looks like provenance.
2. **No estimated numbers.** No interpolation, no averaging two sources into
   one figure. Where sources disagree, both are kept as a range with both ids.
3. **`null` renders as "No cited figure", never as zero.** A missing axis is
   excluded from weighted totals, and every total states how many axes it was
   computed from. A polity with two documented axes must never appear to score
   lower than one with four — this one has tests.
4. **Every chapter names its source.** No `drafted_from`, no build.
5. **Map polygons are never reconciled with cited extents.** They will disagree;
   that is expected. `lib/basemap.ts` contains no function that could compute an
   area, so this cannot be broken by a later edit that looks reasonable.
6. **Influence is never a single number.** Three counts, shown separately. Only
   the reader's sliders combine them, and only in the reader's own view.

Two further rules come from `content/coding-rules.md`: a non-zero count must
name as many items as it claims, and a count of `0` requires a source, because
zero asserts that scholarship looked and found none. If nobody looked, the value
is `null`.

## What is not verified

The build guarantees that citations resolve and that nothing was invented at
entry time. It cannot guarantee that a real citation was read correctly.
`content/VERIFICATION.md` lists all 212 figures and prose attributions grouped by
source, as an unticked checklist, and everything in it should be treated as
unverified until the author has checked it with the book open.

The chapters are AI-drafted and author-reviewed, one polity at a time against a
named source. The site says so on its About page, in plain words, because that
is a fact a reader needs before the first paragraph rather than after the last.

## Not

Not a wiki: no editing, no accounts, no contributions. Corrections are made by
editing files here and redeploying. No greatest-empire ranking is published as
the site's own opinion. No completeness — coverage follows one person's
curiosity and stops at eight polities.

## Credits

Boundaries from [historical-basemaps](https://github.com/aourednik/historical-basemaps)
(CC-BY-4.0). Every textual source is listed on the site's About page and in
`content/sources.yaml`.
