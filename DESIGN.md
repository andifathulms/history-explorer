# DESIGN.md

## The idea

Continuity is the product. Everything else follows from that.

The one memorable element is **the thread**: a continuous vertical line that runs
down the left of every page and never breaks. On the landing view it is the whole
subject — 821 to 1231, drawn once. On a polity page it stays, scrolled to that
polity's position, so you always know where in the sequence you are standing.
Nothing else on the site is allowed to be as loud.

The line is a time axis. Position on it encodes date, so overlaps are visible:
the Saffarids and Samanids ran concurrently and hostile, and you can see that
without being told.

## Color

Persian ceramic, deliberately cooled. Two grounds, each with a job.

| Token | Hex | Job |
|---|---|---|
| `dawat` | `#0E1A24` | Ink-over-lapis. Ground for thread and map views. |
| `kaghaz` | `#E7E9E3` | Cool grey-green paper. Ground for reading views. |
| `kashi` | `#1B4A6B` | Tile blue. Structure: rules, rail, headings on paper. |
| `firuze` | `#3E9C9C` | Turquoise. The thread itself, and only the thread. |
| `zarrin` | `#C08A2E` | Saffron. Peak-phase markers only. Nothing else. |
| `debu` | `#7C8079` | Dust. Secondary text, gap states. |

Dark for navigating, light for reading. Switching grounds tells you which mode
you are in without a label.

`zarrin` appears at most once per screen. If a second gold thing wants to exist,
it does not.

## Type

**Spectral** for everything Latin — headings and body both, distinguished by size
and weight rather than by a second face. It holds up at reading length and has a
slight dryness that suits a reference work.

**Amiri** for Perso-Arabic. It is here to set سامانیان and غزنویان properly,
which is content, not ornament — the writing system is one of the fields the site
records.

Body 18px/1.65, measure capped at 68 characters. Chapter titles 28px/600 in
`kashi` on paper. No all-caps. No eyebrow labels above headings.

## Layout

```
DESKTOP — polity page

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
open rivers, and the rail already supplies a hard left edge.

Edges are labelled on the rail with their type in plain words — *slave-general
of*, *seceded from*. The label is the causation, so it gets space rather than a
tooltip.

## Motion

One orchestrated moment: on the landing view, the thread draws itself once from
821 to 1231, polity names appearing as it passes. Roughly 1.4s, then completely
still.

Nothing else animates on its own. No section entrances, no card hovers.
Interaction-triggered motion is welcome — the rating panel opening, the map
crossfading between snapshot years — because it shows what changed.
`prefers-reduced-motion` skips the draw and renders the finished thread.

## The rating panel

Collapsed by default, at the foot of the page, on paper ground. Four rows.

A missing axis renders as the axis name and *No cited figure* in `debu`, with the
bar area left visibly empty. It is not an error state, not grey-hatched, not
apologetic. An empty bar next to three full ones is the honest picture and should
look intentional.

The three influence counts sit as three separate small numbers with no bar
between them, because they are not one quantity.

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

Second revision: numbered station markers (01 / 02 / 03) down the rail. Dropped
the invented numbering — the sequence is already numbered, by year, and the years
carry information the counters do not.
