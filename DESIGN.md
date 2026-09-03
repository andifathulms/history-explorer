# DESIGN.md

## The idea

**Length is always a cited quantity.**

That is the whole grammar, and it is what holds the sections together now that
there is more than one of them. A span on the timeline, a bar in the rankings, a
segment of the thread: every extent on this site is a number some named work
printed. Nothing is sized by editorial judgment, nothing is sized to fill its
container, and a quantity nobody cited has no length — it renders as visible
absence, at full width, unapologetic.

This is why an empty rating bar sits next to three full ones without hatching or
a warning icon. The bar is not broken. It is the correct rendering of a real
state of scholarship, and dressing it up would be the only dishonest thing the
layout could do.

The earlier version of this document opened "continuity is the product". It is
not; it is one section. What survives from that draft is the thread, demoted from
the site's spine to the continuity section's instrument — which is a promotion in
clarity, because it now means one thing instead of standing in for everything.

## The thread

A continuous vertical line, drawn once, never broken. It belongs to the
**continuity section** and to polity pages *inside a threaded region*. It does
not appear on the home page, the rankings, or on a polity with no edges.

The line is a time axis. Position on it encodes date, so overlaps are visible:
the Saffarids and Samanids ran concurrently and hostile, and you can see that
without being told.

It is scoped to one region and always will be. A single thread through every
polity on the site would be a line through Bukhara and Palembang, which is a
sequence nobody cited — the design rule and the data rule are the same rule here.

When a polity has no thread, its page simply has no rail, and the reading column
takes the full measure. There is no placeholder, no greyed-out rail, no "not
available in this region". An absent instrument is not an error state.

## Color

Persian ceramic, deliberately cooled. Two grounds, each with a job.

| Token | Hex | Job |
|---|---|---|
| `dawat` | `#0B1520` | Ink-over-lapis. Ground for navigating: home, continuity, maps. |
| `kaghaz` | `#E9EBE5` | Cool grey-green paper. Ground for reading and for tables. |
| `kashi` | `#1B4A6B` | Tile blue. Structure: rules, rail, headings on paper. |
| `firuze` | `#3E9C9C` | Turquoise. The thread itself, and only the thread. |
| `zarrin` | `#C08A2E` | Saffron. Peak-phase markers only. Nothing else. |
| `debu` | `#7C8079` | Dust. Secondary text, gap states. |

Each of these now carries steps rather than a single value — `dawat.raise` and
`dawat.edge` for a surface and its hairline, `kaghaz.raise` for a card on paper,
`kashi.deep` for display type, `firuze.bright` for the dark ground. The roles did
not change and no seventh hue was added. A palette gains a colour the moment a
section wants to feel like itself, and a site that recolours by civilisation is
asserting a character for each one.

Dark for navigating, light for reading. Switching grounds tells you which mode
you are in without a label — and with several sections it now carries more
weight than it did with two, because it is the fastest signal of which kind of
page you have landed on.

The palette is deliberately not Persianate-specific in its *roles*, only in its
sourcing. When a Southeast Asian or Mediterranean region is added, the tokens do
not change and must not be themed per region: a site that recolours itself by
civilisation would be asserting a character for each one, which is exactly the
kind of editorial judgment the numbers are kept free of.

`zarrin` appears at most once per screen. If a second gold thing wants to exist,
it does not.

## Type

**Spectral** for reading — chapters, prose, identity lines. It holds up at
reading length and has a slight dryness that suits a reference work.

**Fraunces** for headings, and only headings. The earlier draft of this document
argued for one Latin face distinguished by size alone, and that was right when
the largest thing on the site was 34px. At 84px it stopped being right: Spectral
scaled to display size reads as a large paragraph, not as a title, and the front
door needed a voice. The rule that survives is the underlying one — a second face
must do a different job, not add flavour.

**IBM Plex Mono** for figures: years, percentiles, km², axis labels, table heads,
the kicker above a section title. On this site a number is the subject matter
rather than furniture, and a column of them should line up because they are meant
to be compared. It is also what keeps a slider value from looking like prose you
cannot edit.

**Amiri** for Perso-Arabic. It is here to set سامانیان and غزنویان properly,
which is content, not ornament — the writing system is one of the fields the site
records. A region using another script adds a face on the same terms: because the
content is in that script, not to give the section a flavour.

Body 18px/1.65, measure capped at 68 characters. Display sizes are fluid, so the
hero is a hero on a laptop and still fits a phone without a breakpoint. Chapter
titles in Fraunces, `kashi.deep` on paper.

No all-caps in prose, and no eyebrow labels above a heading *inside* a chapter.
The mono kicker over a section title is navigation furniture rather than an
eyebrow: with seven routes it says which section you are standing in, which is
worth a line.

## Layout

```
DESKTOP — polity page in a threaded region

 821 ┬                    Samanid Empire   سامانیان
     │                    819 – 999
 861 ├─ Saffarid
     │                    Nasr II's Bukhara
 873 │                    ─────────────────────────
     │                    Drafted from: Encyclopaedia
 892 ●  Samanid           Iranica, "Samanids"
     │  ← you are here
     │                    Body text, 68ch measure, set
 962 ├─ Ghaznavid         against the rail so the eye
     │  slave-general of  returns to the same left edge
     │                    on every line.
 999 ┴  conquest
     ↓                    [chapters continue]


DESKTOP — polity page with no thread

     Srivijaya   ᬰ᭄ᬭᬷᬯᬶᬚᬬ
     671 – 1025

     No sourced succession edge runs into or
     out of this polity.

     Body text takes the full measure. The rail
     is absent, not empty.
```

```
MOBILE — rail collapses to a strip

 ┌──────────────────────────────┐
 │ 821 ──────●────────────  1231│   ← position, tappable
 ├──────────────────────────────┤
 │ Samanid Empire               │
 │ سامانیان · 819–999           │
 │                              │
 │ body text, full width        │
 └──────────────────────────────┘
```

Text is left-aligned, ragged right. Justified text with these line lengths would
open rivers, and where the rail exists it already supplies a hard left edge.

Edges are labelled on the rail with their type in plain words — *slave-general
of*, *seceded from*. The label is the causation, so it gets space rather than a
tooltip.

## The home page

A hub: a statement of what the site holds, the corpus drawn as one figure, a row
of live counts, and section cards. It is the one page that must keep working as
sections are added, so it is a grid that grows rather than a composition that
would need rebalancing — the cards went from four to six without a redesign,
which was the test.

It does not draw the thread. The thread was the old landing view, and leaving it
there would keep telling readers that succession is the subject. The corpus
figure is not a replacement hero: it is the grammar, and a grammar scales to
sections that do not exist yet where a hero does not.

## Motion

One orchestrated moment, and it lives in the continuity section: the thread draws
itself once across the region's span, polity names appearing as it passes.
Roughly 1.4s, then completely still.

Nothing else animates on its own. No section entrances, no card hovers on the
home grid. Interaction-triggered motion is welcome — the rating panel opening,
the map crossfading between snapshot years — because it shows what changed.
`prefers-reduced-motion` skips the draw and renders the finished thread.

Confining the draw to one section is the point. When it played on the landing
page it was the site's opening gesture; now it is the signature of the section
that earned it.

## The rating panel

Collapsed by default, at the foot of the polity page, on paper ground. Four rows.

A missing axis renders as the axis name and *No cited figure* in `debu`, with the
bar area left visibly empty. It is not an error state, not grey-hatched, not
apologetic. An empty bar next to three full ones is the honest picture and should
look intentional.

The three influence counts sit as three separate small numbers with no bar
between them, because they are not one quantity.

## The rankings table

Paper ground, because it is read rather than navigated. The sliders sit left and
start even; the ordering is visibly a function of them, so no arrangement reads
as the site's verdict.

Bars obey the grammar: length is the cited figure's percentile, and a polity
missing an axis shows an empty cell in that column rather than a short bar. A
short bar would say *small*. An empty cell says *unknown*, which is the truth.

## The map

Polygons filled at low opacity in `kashi` on `dawat` ground, with edge blur
driven by the `BORDERPRECISION` field — precise borders render crisp, imprecise
ones dissolve. A border you cannot trust should look like one.

The snapshot year sits next to the map at all times, never in a footnote, because
the polygon is the nearest snapshot rather than the peak.

## What I changed and why

The obvious direction for a Persianate history site is warm cream paper, a
high-contrast serif, and gold or terracotta accents — illuminated-manuscript
cosplay. It is also, precisely, the current house style of generated design, and
it would have made the site look like every AI-built portfolio page. Kept the
Persian ceramic sourcing, moved the palette cool and swapped gold for turquoise
as the structural colour, leaving saffron as a single rationed accent.

That choice turned out to matter more after the reframe than before. A palette
tied to one civilisation's ornament would have had to be renegotiated the moment
a second region arrived; a cool, structural palette carries a Srivijayan page
without pretending to be about Srivijaya.

Second revision: numbered station markers (01 / 02 / 03) down the rail. Dropped
the invented numbering — the sequence is already numbered, by year, and the years
carry information the counters do not.

Third revision, this one: the thread stopped being the site. The temptation when
demoting a signature element is to replace it with a new one so the home page
still has a hero. Resisted — the home page is a hub, and the site's identity now
rests on the grammar (length is a cited quantity) rather than on a single drawn
object. A grammar scales to sections that do not exist yet. A hero does not.

## The 2026 rework

The site was correct and looked provisional. Everything in this pass is frame:
no figure moved, no citation changed, and no rule about gaps was relaxed.

**Texture.** One SVG grain at 5% on dark and 3.5% on paper, and one wide wash of
tile blue behind the top of dark landing views. That is the entire inventory. The
wash never sits behind reading text and the grain never costs contrast. The
temptation with a dark ground is to keep adding glow until the page looks lit;
resisted, because the corpus figure is the only thing on the home page that
should draw the eye.

**The corpus figure.** The home page now opens with every polity drawn as a
hairline on one axis. This is the grammar shown rather than asserted — the same
bars the timeline and the rankings use, at the density that shows how much of
history the corpus is and is not. It is deliberately not an illustration: there
is no artwork here that a reader could mistake for an argument.

**Bars in every ranking column.** The table used to draw a bar only for the
weighted total, which is the one number the site does not stand behind. The
three it does stand behind were text. Now every axis carries the bar, an absent
axis leaves the bar area empty and says *No cited figure* in words, and a
contested longevity draws both ends of its range.

**A shell.** Sticky nav, a footer that restates the constraint rather than the
branding, and one set of page primitives. Adding a section is supposed to be a
new route over the same corpus, and that is only true if the frame is not part of
what has to be rewritten.

**What was resisted.** A hero image. A second accent colour. Card hovers on the
home grid that lift and shadow. Scroll-triggered entrances. Each of those would
have made a screenshot better and the reading worse, and the site's identity
still rests on the grammar — length is a cited quantity — rather than on any one
drawn object.
