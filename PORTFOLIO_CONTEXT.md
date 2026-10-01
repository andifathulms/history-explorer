---
schema: portfolio-context/v2
slug: history-explorer
title: History Explorer
generated: 2026-10-01
repo: andifathulms/history-explorer
track: lab
problemShape: explainer
status: live
liveUrl: https://andifathulms.github.io/history-explorer/
stagingUrl: null
access: public
githubUrl: https://github.com/andifathulms/history-explorer
role: Solo developer
team: solo
timeframe:
  start: 2026-09-03
  end: ongoing
launched: null
techStack: [Next.js, TypeScript, Tailwind CSS, D3, MDX, YAML, GitHub Actions, GitHub Pages]
---

## 1. Summary

History Explorer is a static reference site that describes, ranks, and traces the succession of 419 historical states, where every figure and every succession claim links to a real, named source and anything nobody has published a figure for is shown as a stated gap instead of an estimate.

## 2. Audience and problem

The primary and stated user is the author himself: the README and PRD both describe it as "a reading app the author built for himself," where success is defined as "he reads it." The problem it addresses generalizes to anyone comparing historical states: a question like "how large was the Samanid Empire" returns different, uncited numbers across general reference sites, and no reference work exposes the succession relationships between polities (e.g. a Samanid slave-general founding the dynasty that later destroyed his former masters) as a single browsable structure. The site has no accounts, no editing, and no contribution flow — corrections happen by editing the source files and redeploying. The binding constraint, enforced in code rather than left as a writing guideline, is that no number may be invented, interpolated, or estimated: a missing figure must render as a stated absence, and a polity with two documented measurement axes must never appear to score lower than one with four just because of how a missing axis is handled.

## 3. My role

Solo developer and sole author of every commit (`git shortlog -sn --all` shows one contributor across 1,226 commits). I designed and built the data model and its build-time enforcement (`lib/content.ts`, `lib/types.ts`), the percentile/weighting math (`lib/ratings.ts`), the gap-handling type system (`lib/gaps.ts`), the succession-graph and thread rendering, the D3-based peak-extent maps, the CI enforcement scripts (`check-voice.mjs`, `check-links.mjs`, `verification-report.mjs`), and the full Next.js frontend. The 419 polity records and 3,176 MDX chapters are AI-drafted against a named source per polity and then reviewed and corrected by me — this method is disclosed on the site's own About page rather than presented as unaided authorship.

## 4. Decisions

### Decision: Ship as a fully static export with no backend, database, or API route

- Why: the PRD requires the whole site to deploy for free on GitHub Pages and to run with nothing to operate — content changes by editing files and redeploying, not by writing to a database.
- Alternatives: none recorded in the repo; static export was the starting architecture from the first commit.
- Result: `next.config.mjs` sets `output: 'export'`; all content (~700 YAML files, 3,176 MDX files) is read once at build time in `lib/content.ts` and baked into static HTML. `server-only` is imported in `lib/content.ts` specifically so content-loading code cannot leak into the client bundle.
- Evidence: `next.config.mjs`; `lib/content.ts`; commit `d4106c1` (2026-09-03, "scaffold Next.js 14 static export with design tokens").

### Decision: Enforce the no-invented-data rules at build time, not as a style guide

- Why: a sourcing rule that only lives in documentation is not verifiable; the project's stated position is that a dangling citation id is worse than a visible gap, because a gap is honest and a dangling id looks like provenance.
- Alternatives: a linter run manually before commit (rejected — would not block a bad deploy); trusting manual review of each polity file (rejected — the corpus grew to 419 records, too large to review by eye every time).
- Result: `next build` throws if a chapter has no `drafted_from` field, if any `source:` id fails to resolve against `content/sources.yaml`, if an edge type, institution value, or turning-point type falls outside its closed vocabulary in `lib/types.ts`, or if a region is flagged `thread: true` with no edge connecting two of its own polities.
- Evidence: `lib/content.ts`; `lib/types.ts`; commit `fdd4d9a` (2026-09-03, "type the content model and make gaps a first-class value").

### Decision: Represent a missing figure as a distinct `Gapped<T>` type, never as `null` collapsing to zero

- Why: a missing measurement (e.g. peak population) must be excluded from a weighted ranking total, not silently treated as zero, or a polity with less scholarship attached to it would rank as if it scored zero on that axis.
- Alternatives: representing an absent figure as `0` or `undefined` with an ad hoc check at each call site (rejected — every consumer would have to remember to check, and one that forgot would silently miscompute a ranking).
- Result: `lib/gaps.ts` defines `Gapped<T>` with explicit `isPresent`/`value` accessors and a `renormalise` function so a weighted total states how many axes it was actually computed from; `lib/ratings.test.ts` has a passing test asserting "a polity with no edges is absent from the tally, not zero-ranked."
- Evidence: `lib/gaps.ts`; `lib/ratings.test.ts`; commit `fdd4d9a`.

### Decision: Scope every succession thread to a single region; there is no global succession line

- Why: drawing one continuous line across the whole corpus (e.g. from a Central Asian polity to a Southeast Asian one) would visually assert a historical sequence that no cited source supports.
- Alternatives: an early draft of the design document considered the succession thread as the organizing structure for the entire site (DESIGN.md: "the earlier version of this document opened 'continuity is the product'"). That framing was reversed within the same day the design doc was first written.
- Result: `content/regions.yaml` requires `thread: true` regions to have at least one internal edge, enforced by the loader; of 57 regions, 43 currently carry a thread and 14 do not, which the project treats as an ordinary, non-deficient state rather than missing data.
- Evidence: `lib/thread.ts` (commit `f090a8e`, 2026-09-03); DESIGN.md; commit `20e717f` (2026-09-03, "a grammar that spans sections, not a single signature object" — the commit that walked back the earlier "continuity is the product" framing); `content/regions.yaml`.

### Decision: Rank by percentile rather than raw magnitude, despite percentile compressing large differences

- Why: percentile ranking is documented as unaffected by outliers and stable with a small reference set; the tradeoff is explicit in the code comment: under percentile, empires spanning nearly two orders of magnitude in territory can land at nearly the same percentile.
- Alternatives: ranking by raw magnitude (rejected in the code comment as being distorted by a handful of outliers, e.g. the Mongol Empire, at the top of the scale).
- Result: `lib/ratings.ts` implements percentile as the default scale and documents the magnitude-compression tradeoff directly in the source rather than hiding it.
- Evidence: `lib/ratings.ts` (module and function-level comments).

### Decision: Never let cited peak-extent figures and map-polygon area agree

- Why: the polygon boundaries (from an independent open geodata project) and the cited km² figures (from cited demographic-history sources) come from unrelated datasets and are expected to disagree; reconciling them would mean quietly editing one dataset to match the other, which is the same kind of invention the sourcing rules forbid elsewhere.
- Alternatives: computing an area from the rendered polygon and displaying it as the measurement (rejected explicitly).
- Result: `lib/basemap.ts` contains no function capable of computing an area from a polygon, making the "don't reconcile" rule structurally hard for a later edit to violate; every map is labeled as an illustration with its own snapshot year.
- Evidence: `lib/basemap.ts`; commit `2d9eb1c` (2026-09-03, "peak-extent polygons, with all three honesty rules on screen").

## 5. Outcomes

| Metric | Value | Kind | Source |
| --- | --- | --- | --- |
| polities described, each with a full page and ranking | 419 | scale | `find content/polities -name polity.yaml \| wc -l` |
| distinct historical sources cataloged and cited | 678 | scale | `grep -cE "^\s*-\s*id:" content/sources.yaml` |
| succession edges modeled between polities | 431 | scale | `grep -cE "^\s*-\s*from:" content/edges.yaml` |
| chapters published, each required to name the source it was drafted from | 3,176 | scale | `find content/polities -name "*.mdx" \| wc -l`, cross-checked against 0 files missing `drafted_from` (`grep -L drafted_from content/polities/*/*.mdx \| wc -l`) |
| regions the corpus is organized into (43 carry a succession thread, 14 don't) | 57 | scale | `grep -cE "^\s*-\s*id:" content/regions.yaml`; thread flags counted with `grep -cE "^\s+thread: (true\|false)\s*$" content/regions.yaml` |
| numbers-only reference/backdrop polities used to make rankings globally comparable | 49 | scale | `grep -cE "^\s*-\s*\{ id:" content/reference-set.yaml` |
| world-population/world-land denominator years used for era-normalized rankings | 6 | effort | `grep -cE "^\s*-\s*\{\s*year:" content/reference-set.yaml` |
| passing unit tests (ratings, resumption, transfer rules) | 38 | effort | `npm test` (Node's built-in test runner) |
| commits | 1,226 | effort | `git rev-list --count HEAD` |
| days from first to latest commit | 25 (2026-09-03 to 2026-09-27) | effort | `git log --format=%ad --date=short` |
| TypeScript/TSX lines across `app/`, `components/`, `lib/` | 14,129 | effort | `find app components lib -name "*.ts" -o -name "*.tsx" \| xargs wc -l \| tail -1` |
| content lines (YAML + MDX + markdown) under `content/` | 272,351 | effort | `find content -name "*.yaml" -o -name "*.mdx" -o -name "*.md" \| xargs wc -l \| tail -1` |
| React components | 38 | effort | `ls components/*.tsx \| wc -l` |
| top-level routes | 10 | effort | `find app -name page.tsx \| wc -l` |

Only scale and effort figures exist: there is no usage data (visits, return readers) recorded anywhere in the repo, consistent with the project's own framing that its one user is its author.

## 6. Limits and next steps

- `content/VERIFICATION.md` (generated by `npm run verify`) lists every cited figure and prose attribution as an unticked checklist item: 4,874 of 6,671 lines are currently unticked. The README states explicitly that everything in this file "should be treated as unverified until the author has checked it with the book open" — the build guarantees a citation resolves to a real source id, not that the source was read correctly.
- `CLAUDE.md`'s own audit section states that, as of its last update, 75 polities show an empty predecessor line and 61 an empty successor line (34 show both), which it calls "almost always the wrong answer" — a real predecessor/successor usually exists and simply has no `preceded_by_external`/`succeeded_by_external` entry yet. This figure comes from CLAUDE.md itself and was not independently recomputed for this document.
- No automated frontend test suite exists for `app/` or `components/` (no test files found, `npm test` only runs `lib/*.test.ts`); UI correctness is checked manually against the checklist in CLAUDE.md's "Frontend standards" section (screenshot at 1440px and 390px, check for hydration errors) rather than by an automated visual or accessibility test.
- CI (`.github/workflows/deploy.yml`) runs on push to `main` only — there is no separate pull-request gate, which is consistent with this being a solo project with no branches under review.

## 7. Technical detail

- Framework: Next.js 14.2, App Router, `output: 'export'` in `next.config.mjs`; `basePath` is read from `NEXT_PUBLIC_BASE_PATH` at build time so the same code serves both local dev (empty base path) and the GitHub Pages project subpath, with no code change between the two.
- Content pipeline: `lib/content.ts` reads and validates every `content/polities/<id>/polity.yaml` and its MDX chapters at build time using `gray-matter` (frontmatter) and the `yaml` package; nothing is fetched or parsed at runtime.
- Data-honesty types: `lib/gaps.ts` (`Gapped<T>`, `isPresent`, `value`, `renormalise`, `provenanceLabel`) and `lib/types.ts` (closed vocabularies for end types, edge types, arc phases, turning-point types, institution values, and source kinds — an out-of-vocabulary value fails the build by id).
- Percentile/ranking math: `lib/ratings.ts` computes global percentiles per axis across the narrative corpus plus the reference backdrop, on either an absolute or an era-normalized scale (peak km² over cited world land under state control at that date, from `content/reference-set.yaml`'s `world_denominators`); if a denominator is missing for a date, era-normalized mode shows a gap rather than falling back to absolute.
- Same-object-twice modeling: `lib/resumption.ts` implements the `resumes` field (used on 6 polities, e.g. the two Babylons) as distinct from a succession edge — it carries no year and is not drawn by a region's thread — with its own test suite in `lib/spine.test.ts` and `lib/transfers.test.ts` asserting, for example, that a pair is either a succession or a resumption but never both.
- Visualization: D3 point modules only (`d3-geo`, `d3-scale`, `d3-shape`, `d3-array`), no bundled full D3 and no charting library; extent-over-time is drawn as discrete columns at cited years, never a connecting line, per `lib/figures.ts`/`components/ExtentTrajectory.tsx`.
- Testing: Node's built-in test runner (`node --test lib/*.test.ts`), 38 tests across `lib/ratings.test.ts`, `lib/spine.test.ts`, `lib/transfers.test.ts`, all currently passing.
- CI/CD: GitHub Actions (`.github/workflows/deploy.yml`) runs `typecheck`, `test`, `check:voice` (a ratcheted lint against `content/voice-baseline.txt` catching AI-drafted prose that talks about the schema instead of the subject), `build`, then `check:links` (walks the static export and fails if an internal link misses the GitHub Pages `basePath` or points at a missing file — added after breadcrumb links 404'd in production despite a fully green build), then deploys via `actions/deploy-pages`.
- SEO/metadata: every route builds its `Metadata` from a single `pageMeta()` helper in `lib/seo.ts` so canonical URLs and social-card data are generated from one absolute base rather than per page; a per-polity Open Graph image is drawn at build time by `app/polity/[id]/opengraph-image.tsx` and follows the same "a bar's length is a cited quantity" rule as the page itself.
- Map data: 26 trimmed snapshot files under `data/basemaps/` (1500 BC to AD 1700) sourced from `aourednik/historical-basemaps` (CC-BY-4.0), regenerated with `scripts/trim-basemaps.mjs`.

## 8. Corrections

- `README.md`'s "Where it stands" table (last updated at an earlier point in the project) states 359 polities, 2,601 chapters, 556 sources, 382 edges, and "39 regions carry [a thread]; 9 do not." The current repository state is 419 polities, 3,176 chapters, 678 sources, 431 edges, and 43 regions carrying a thread against 14 that don't (`grep`/`find` commands above). The README itself acknowledges this drift ("Counts move; the live Polities and Sources pages compute their own and cannot go stale"), so the stale numbers are a known, accepted limitation of a static document rather than an error, but they should not be quoted as current.
- CLAUDE.md's worked audit example (`content/polities/aceh`) states specific historical figures (e.g., "144 years" and "one event carrying two different years") as illustrations of a review method, not as project-wide metrics; these were not treated as repo-wide facts in this document.

## 9. Publishing notes

None. The repository is public, contains no credentials, internal hostnames, or personal data beyond the author's own attribution (already public on the README and the live site), and its content is historical reference material with no client-confidential or government-sensitive material.

## 10. Screens

- `/` — home hub: section cards and corpus-wide counts (polities, sources, edges), drawing no succession thread.
- `/polity/samanid/` — a single polity page: dark hero with name in Latin and original script, succession summary, chapters, facts panel, peak-extent map, and a collapsed rating panel.
- `/rankings/` — the ranked table with reader-movable weight sliders and the absolute/era-normalized toggle; shows full rating bars next to explicit "No cited figure" gaps in the same row.
- `/continuity/khurasan-and-transoxiana/` — a single region's succession thread: the vertical time-axis line with dated, typed edges between polities.
- `/timeline/` — every polity's span drawn on one shared axis, showing concurrency (e.g. two hostile, overlapping dynasties) without relying on prose.
- `/sources/` — every cataloged source and how much of the site rests on each one, with a filter.
