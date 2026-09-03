# PRD — Sambung (working name)

A read-only history site about how one polity becomes the next.

Working name is a placeholder. Alternatives in the same vein: *Alih* (handover),
*Waris* (inheritance), *Susur* (to trace along).

---

## 1. Why this exists

Wikipedia has an article on the Samanids and an article on the Ghaznavids. It
does not have the thing that connects them: Alptigin was a Samanid Turkic
slave-general who took Ghazna and founded a line that outlived his masters. The
Ghurids were Ghaznavid vassals who eventually destroyed their former overlords.
The Khwarazmshahs were Seljuk provincial governors who inherited the empire that
appointed them.

That pattern — secession, usurpation by generals, vassals swallowing overlords —
is the actual subject. It lives in the edges between articles, and no reference
work exposes it as something you can browse.

This is a reading app the author built for himself. Success is that he reads it.

## 2. What it is

A static site. Each polity has a narrative page in flexible chapters. Polities
are joined by typed succession edges. A rating panel sits on each page as a
secondary feature.

Not a wiki: no editing, no accounts, no contributions. Corrections are made by
editing files in the repository and redeploying.

## 3. Scope of v1

**Narrative corpus — the Iranian Intermezzo and its bookends (8 polities):**

| Polity | Approx. span |
|---|---|
| Tahirid | 821–873 |
| Saffarid | 861–1003 |
| Samanid | 819–999 |
| Buyid | 934–1062 |
| Ghaznavid | 977–1186 |
| Great Seljuk | 1037–1194 |
| Ghurid | 879–1215 |
| Khwarazmian | 1077–1231 |

Chosen because they form one continuous thread in one region, they are the thing
the author actually wants to read, and they stress-test every feature: dense
succession edges, contested dates, and polities with almost no quantitative
scholarship attached to them.

The Abbasid Caliphate appears as a **context polity** — it is an edge target and
appears on the timeline, but has no chapters in v1.

**Reference backdrop (~50 polities, numbers only):** peak extent, span, and peak
population for the largest polities in world history, from Taagepera and
McEvedy & Jones. No prose, no pages, not browsable. They exist solely so that a
global percentile is a true statement rather than a comparison against eight
things.

**Explicitly out of scope for v1:** world narrative coverage, search, editing,
user accounts, any backend.

## 4. The polity page

Order matters. The page opens on story and ends on numbers.

1. **Header** — name in Latin and in Perso-Arabic script, span, one-line
   identity.
2. **Position in the thread** — where this polity sits between predecessors and
   successors, with the edges named. Always visible.
3. **Chapters** — free-form, 2–8 per polity, each with a title the author wrote.
   Every chapter carries the source it was drafted from.
4. **Facts** — capital(s) and core region; founder, peak-era ruler, last ruler
   (three only, not a dynasty list); writing system and languages of
   administration; how it ended.
5. **Rating panel** — collapsed by default.

### Chapters

Chapters are free-form. Each *may* carry an optional phase tag
(`formation`, `expansion`, `peak`, `contraction`, `end`, `afterlife`) so the
timeline can align chapters across polities. The tag is optional because the
template does not fit everyone: the Ghurids barely had a golden age before
Khwarazm ended them, and forcing a "Golden Age" chapter would mean writing
something untrue.

### How it ended

A closed vocabulary, not prose, so it is filterable and feeds the graph:
`conquest` · `fragmentation` · `dynastic replacement` · `gradual absorption` ·
`internal usurpation` · `still contested`

## 5. Succession edges

The core object. Typed, directional, dated, and cited.

Edge types: `seceded from` · `overthrew` · `slave-general of` · `vassal of` ·
`absorbed remnants of` · `claimed legitimacy of` · `partitioned from` ·
`conquered by`

Each edge carries: source polity, target polity, type, approximate year, a
one-sentence explanation, and a citation.

An edge is a claim about causation and is held to the same sourcing standard as
prose. Where scholarship disagrees on the nature of a transition, record two
edges and mark both as contested rather than picking one.

## 6. Ratings

A side feature. Four axes, all computed from cited numbers, never from
editorial judgment.

| Axis | Measure | Primary source |
|---|---|---|
| Reach | Peak territorial extent, km² | Taagepera |
| Longevity | Duration in years, as a min–max range | Per-polity, cited |
| Demographic weight | Peak population | McEvedy & Jones |
| Influence | Three separate raw counts, never fused | Per-polity, cited |

**Influence is not a score.** It is three visible counts: descendant writing
systems, religions carried, and successor states claiming its legitimacy. The
reader's slider weights fuse them if the reader wants that. The app never
publishes a single influence number of its own.

**Both scales, toggleable:** absolute figures, and share of world land or world
population at that date. A million km² in 500 BC is not a million km² in 1900.

**Weights:** presets (*reach lens*, *longevity lens*, *influence lens*) plus free
sliders. Reader state is reflected in the URL so a view can be linked.

**Gaps are content.** Where no citable figure exists, the axis reads
"No cited figure" and is excluded from the weighted total — never zero, never
estimated. Expect this often for the Ghurids and Saffarids. Which polities
scholarship has bothered to quantify is itself informative.

**Percentiles are global**, computed against the narrative corpus plus the
reference backdrop.

## 7. Map

Peak-extent polygons from `aourednik/historical-basemaps` (GeoJSON, CC-BY,
snapshots from 2000 BC onward).

Three honesty requirements, non-negotiable:

- Snapshots are at fixed years. The polygon shown is the **nearest snapshot to
  the peak, not the peak**. Label it with the snapshot year.
- The polygon's computed area will not match the cited km². **Do not reconcile
  them.** The cited figure is the figure; the map is an illustration.
- Border precision varies wildly. The dataset carries a `BORDERPRECISION` field
  per feature — drive edge softness from it, so imprecise borders literally look
  imprecise.

The dataset author's own caveat belongs in the UI, not the footnotes: territorial
boundary as a concept is meaningful in Europe only after Westphalia, ancient
polities overlap, and old vector borders on modern coastlines mislead because
rivers and shorelines move.

## 8. Views

- **Thread** (landing) — the succession spine, walkable end to end. This is the
  front door, not the ranked table.
- **Polity page** — as above.
- **Timeline** — the eight polities as overlapping spans, chapters aligned by
  phase tag where present.
- **Comparison** — the ranked table with weight sliders, against the global set.

## 9. Content sourcing

Chapters are AI-drafted and author-reviewed. This is a deliberate tradeoff: the
alternative is not writing the app at all.

The mitigation is that drafting is done **against a named source, one polity at
a time** — Encyclopaedia Iranica, the Cambridge History of Iran, Encyclopaedia
of Islam, Bosworth's *The New Islamic Dynasties* — and that source is printed on
the page. The app is structured reading notes with visible provenance, not
generated content presented as authority.

A standing note on the site says exactly this, in plain words.

## 10. Non-goals

- Not a wiki, not editable, no contributions.
- No single "greatest empire" ranking published as the app's own opinion.
- No estimated, interpolated, or inferred numbers anywhere.
- No completeness. Coverage follows the author's curiosity, and the site says so.
