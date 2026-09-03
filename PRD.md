# PRD — History Explorer

A read-only reading site about polities: what they were, how far they reached,
how long they lasted, how many people they held, what they left behind — and,
where a source says so, how one became the next.

---

## 1. Why this exists

Two things are hard to get from a reference work.

**The first is comparison you can trust.** "Was the Samanid Empire big?" has an
answer, but getting it means opening several articles, finding that three of them
quote different figures from the same source, and that a fourth quietly repeats a
number nobody has ever cited. Any ranked list of empires you can find online is
either unsourced, silently estimated, or a single opinion presented as a total.

**The second is connection.** Wikipedia has an article on the Samanids and an
article on the Ghaznavids. It does not have the thing that joins them: Alptigin
was a Samanid Turkic slave-general who took Ghazna and founded a line that
outlived his masters. The Ghurids were Ghaznavid vassals who eventually destroyed
their former overlords. That pattern lives in the edges between articles and no
reference work exposes it as something you can browse.

This site does both, under one constraint that produces both: **every claim
carries the work it came from, and where no figure exists the gap is drawn rather
than filled.**

This is a reading app the author built for himself. Success is that he reads it.

## 2. What it is

A static site with several sections, added to over time the way a blog is. Each
polity has a page. The sections are different ways through the same corpus.

| Section | What it is |
|---|---|
| **Polities** | The reading core. Chapters, facts, peak-extent map, rating panel. |
| **Rankings** | Every polity measured on four axes against a global reference set, weighted by reader sliders. |
| **Continuity** | Typed, dated, cited succession — where one polity became the next. Regional. |
| **Timeline** | Spans on one axis, so concurrency is visible. |
| **About** | Method, limits, and every source. |

Sections are expected to be added. The architecture should make a new one a new
route over the existing corpus, not a migration.

Not a wiki: no editing, no accounts, no contributions. Corrections are made by
editing files in the repository and redeploying.

### Continuity is a property, not the spine

This is the load-bearing point of the whole design, and the easiest thing to get
wrong later.

Succession is something **some** polities have. The Iranian Intermezzo is unusually
dense with it, which is why it was chosen first. Rome, Srivijaya, the Inca, Aksum
— these will enter the site as full polities with pages, chapters and rankings,
and most will have **no sourced succession edge to anything already here**, and
never will.

Therefore:

- A polity **never** requires an edge. No edges is an ordinary, complete state.
- The rankings include every polity, threaded or not. Measurement does not require
  a predecessor.
- A thread is scoped to a **region** and drawn only where the edges exist. There is
  no global thread and there must never be one — a single line through Bukhara and
  Palembang would assert a sequence nobody cited.
- Nothing in the UI may describe an edgeless polity as incomplete, pending, or
  missing data.

## 3. Regions

A region groups polities for browsing and gives a continuity thread its boundary.
It is **not** a claim that the polities inside it were one civilisation, one
people, or one story.

`content/regions.yaml` carries an id, a name, a blurb, and `thread: true|false`.
A region claiming a thread must have at least one edge joining two of its own
polities; the loader enforces this, because a mistaken flag would draw an empty
spine and imply a continuity nobody sourced.

## 4. Scope of v1

**First region — the Iranian Intermezzo and its bookends (8 polities):**

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

Chosen because they stress-test every feature at once: dense succession edges,
contested dates, and polities with almost no quantitative scholarship attached to
them. A region this connected is the *hardest* case for the continuity section and
the *worst* case for the rankings, which is what makes it a good first region.

The Abbasid Caliphate and the Karakhanids appear as **context polities** — edge
targets with figures and a timeline row, but no chapters yet.

**Reference backdrop (~50 polities, numbers only):** peak extent, span, and peak
population for the largest polities in world history, from Taagepera and
McEvedy & Jones. No prose, no pages, not browsable. They exist solely so that a
global percentile is a true statement rather than a comparison against eight
things. A backdrop entry is **not** a stub of a future polity page; promoting one
means opening a source and writing chapters, like any other.

**Explicitly out of scope for v1:** search, editing, user accounts, any backend.
World coverage is not out of scope so much as unbounded — it proceeds one polity
at a time, and the site never claims completeness.

## 5. The polity page

Order matters. The page opens on story and ends on numbers.

1. **Header** — name in Latin and in its own script, span, one-line identity.
2. **Succession** — the edges in and out, named. Where there are none, one
   sentence saying so, framed as a fact about the corpus rather than the polity.
3. **Chapters** — free-form, 2–8 per polity, each with a title the author wrote.
   Every chapter carries the source it was drafted from.
4. **Facts** — capital(s) and core region; founder, peak-era ruler, last ruler
   (three only, not a dynasty list); writing system and languages of
   administration; how it ended.
5. **Map** — peak-extent polygon, labelled with its snapshot year.
6. **Rating panel** — collapsed by default.

The thread rail appears in the margin only when the polity stands in a threaded
region, and shows that region only.

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

## 6. Succession edges

The core object of the continuity section. Typed, directional, dated, and cited.

Edge types: `seceded from` · `overthrew` · `slave-general of` · `vassal of` ·
`absorbed remnants of` · `claimed legitimacy of` · `partitioned from` ·
`conquered by`

Each edge carries: source polity, target polity, type, approximate year, a
one-sentence explanation, and a citation.

An edge is a claim about causation and is held to the same sourcing standard as
prose. Where scholarship disagrees on the nature of a transition, record two
edges and mark both as contested rather than picking one.

Edges may eventually cross regions — a claimed-legitimacy edge from an Ottoman
sultan to Rome is a real thing to record. A thread still draws only the edges
inside its own region.

## 7. Rankings

Four axes, all computed from cited numbers, never from editorial judgment.

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

**Percentiles are global**, computed against every polity on the site plus the
reference backdrop, across all regions.

## 8. Map

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
- No forcing of polities into a thread. A region without succession is not a
  region with a problem.
