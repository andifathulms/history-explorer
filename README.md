<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/lockup-dark.png">
  <img src="public/brand/lockup-light.png" alt="History Explorer" width="420">
</picture>

**What polities were, how far they reached, how long they lasted — and where a source says so.**

[**Read the site →**](https://andifathulms.github.io/history-explorer/)

[![Deploy](https://github.com/andifathulms/history-explorer/actions/workflows/deploy.yml/badge.svg)](https://github.com/andifathulms/history-explorer/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-0B1520?labelColor=0B1520&color=1B4A6B)
![Static export](https://img.shields.io/badge/static-no%20backend-0B1520?labelColor=0B1520&color=3E9C9C)
![Licence](https://img.shields.io/badge/content-sourced%20%26%20cited-0B1520?labelColor=0B1520&color=C08A2E)

</div>

---

One constraint produces the whole thing:

> **Every claim carries the work it came from, and where no figure exists the gap
> is drawn rather than filled.**

No number here is estimated, interpolated, or inferred. A polity with two
documented axes must never appear to score lower than one with four — so every
total states how many axes it was computed from, and an empty bar beside three
full ones is the honest picture rather than an apology.

## Sections

| | |
|---|---|
| **Polities** | The reading core — chapters, cited facts, a snapshot map, a rating panel. |
| **Rankings** | Four axes against a global reference set, weighted by sliders you set. |
| **Continuity** | Typed, dated, cited succession, scoped to a region. |
| **Timeline** | Spans on one axis, so concurrency is visible rather than inferred. |
| **Endings** | How states stopped, against a closed vocabulary. |
| **Sources** | Every work, and how much of the site rests on each of them. |
| **About** | Method and limits, in plain words rather than small type. |

Continuity is one section, not the spine. Succession is a property some polities
have: one that seceded from nothing and was inherited by nobody gets a full page
and a full ranking, and simply has no thread to stand in.

## Where it stands

| | |
|---|---|
| Polities | **359**, across **48** regions |
| Chapters | **2,601**, each naming the source it was drafted from |
| Span | 3000 BC to AD 1974 |
| Threads | **39** regions carry one; 9 do not, which is ordinary |
| Sources | **556** works · **382** succession edges |
| Backdrop | **49** reference polities and 6 world denominators, numbers only |

Counts move; the live [Polities](https://andifathulms.github.io/history-explorer/polities/)
and [Sources](https://andifathulms.github.io/history-explorer/sources/) pages
compute their own and cannot go stale.

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # static export to out/
```

The checks CI runs, in the order it runs them:

```bash
npm run typecheck
npm test               # ratings invariants
npm run check:voice    # chapters address a reader, not the schema
npm run build
npm run check:links    # every internal link resolves in the export
```

Two content utilities:

```bash
npm run basemaps       # refetch and re-trim the historical-basemaps snapshots
npm run verify         # regenerate content/VERIFICATION.md
```

Fully static: no backend, no database, no API routes, nothing fetched at
runtime. `NEXT_PUBLIC_BASE_PATH` sets the base path for a GitHub Pages project
site, and CI passes it automatically — pass it to `check:links` too, or it will
report every prefixed link as broken.

## Where things are

```
content/
  regions.yaml          browsing groups; each says whether it carries a thread
  coding-rules.md       the influence rulebook — read this before touching counts
  sources.yaml          the closed set of citable works
  edges.yaml            the succession edges; optional per polity
  reference-set.yaml    backdrop polities, numbers only, plus world denominators
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
public/brand/           the served subset of the brand export
```

The design tool writes its full output to `exports/`, which is not tracked.
What the site serves is copied into `public/brand/`.

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
   computed from — this one has tests.
4. **Every chapter names its source.** No `drafted_from`, no build.
5. **Map polygons are never reconciled with cited extents.** They will disagree;
   that is expected. `lib/basemap.ts` contains no function that could compute an
   area, so this cannot be broken by a later edit that looks reasonable.
6. **Influence is never a single number.** Three counts, shown separately. Only
   the reader's sliders combine them, and only in the reader's own view.
7. **A polity never requires an edge, and threads never cross regions.** A
   region claiming `thread: true` with no edge joining two of its own polities
   fails the build, because an empty spine would imply a continuity nobody
   cited — the same class of error as a dangling source id.
8. **Nothing is drawn that a source did not date.** No line joins two cited
   figures, and no mark sits at a year nobody published. An interpolation is
   harder to notice in pixels than in YAML, which is exactly why it is barred
   in both.

Every closed vocabulary — end types, edge types, arc phases, turning-point
types, institutions, source kinds — is a fixed list in `lib/types.ts`, and a
value outside it fails the build by id.

Two further rules come from `content/coding-rules.md`: a non-zero count must
name as many items as it claims, and a count of `0` requires a source, because
zero asserts that scholarship looked and found none. If nobody looked, the value
is `null`.

## What is not verified

The build guarantees that citations resolve and that nothing was invented at
entry time. It cannot guarantee that a real citation was read correctly.
`content/VERIFICATION.md` lists every figure and prose attribution grouped by
source, as an unticked checklist, and everything in it should be treated as
unverified until the author has checked it with the book open.

The chapters are AI-drafted and author-reviewed, one polity at a time against a
named source. The site says so on its
[About](https://andifathulms.github.io/history-explorer/about/) page, in plain
words, because that is a fact a reader needs before the first paragraph rather
than after the last.

## Not

Not a wiki: no editing, no accounts, no contributions. Corrections are made by
editing files here and redeploying. No greatest-empire ranking is published as
the site's own opinion. No completeness — coverage follows one person's
curiosity. No polity is forced into a thread to make the continuity section look
fuller.

## Credits

Boundaries from [historical-basemaps](https://github.com/aourednik/historical-basemaps)
(CC-BY-4.0). Every textual source is listed on the site's
[Sources](https://andifathulms.github.io/history-explorer/sources/) page and in
`content/sources.yaml`.

Designed and built by [Andi Fathul Mukminin](https://andifathulms.github.io/en/) ·
[GitHub](https://github.com/andifathulms) ·
[LinkedIn](https://www.linkedin.com/in/andifathulmukminin/)
