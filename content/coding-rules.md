# Coding rules

Binding rules for the structured fields that are judgements rather than
transcriptions. Sections 1-3 cover the three influence counts; section 4 covers
turning points; sections 5-8 cover the four institutional codings. Read the relevant section before entering any data, and apply
it uniformly — including to the polities where the answer is inconvenient, and
including to regions added later, where the temptation to bend a definition to
fit an unfamiliar case will be strongest.

---

# Part one: influence counts

Three counts are recorded per polity: **descendant scripts**, **religions
carried**, **successor claims**. They are counts of named items, never a score.
Without a rulebook the counts are opinions wearing a number, so this file fixes
the decisions before any data is entered, and the same rules are applied to
every polity — including the ones where the answer is inconvenient.

Two standing requirements:

1. **Every counted item is named and cited.** A count of 3 must be accompanied
   by three `items` and a source id. A number without its items is not enterable.
2. **If the rule cannot be applied because no source addresses the question, the
   whole count is `null`, not 0.** Zero is a claim ("scholarship looked and
   found none"). Null is the absence of a claim. They render differently and
   they must not be confused.

---

## 1. Successor claim

> **Counted when a later polity asserts the earlier polity's legitimacy in its
> own public self-description — titulature, coinage, khutba, or chancery
> style — and a cited source records the assertion.**

Included:

- **Titulature and public style.** A ruler taking the earlier polity's title
  counts. This is the paradigm case (the Ottoman *Kayser-i Rûm*).
- **Coinage and khutba.** Striking coin in a predecessor's name, or naming them
  in the Friday sermon, is a public claim and counts.
- **Unrecognised claims count the same as recognised ones.** The count measures
  whose legitimacy was worth claiming, not who succeeded in claiming it. A
  claim rejected by everyone still tells you the earlier polity was a currency.
  Recognition is not a filter, because filtering on it would smuggle in a
  judgement about outcomes.

Excluded:

- **Dynastic descent on its own.** Being descended from a house is not claiming
  it. Descent counts only when it is *invoked publicly as the basis of a right
  to rule* and a source says so. This is the rule most likely to feel wrong in
  a given case; it is applied anyway, because "who was related to whom" is a
  genealogy, and genealogies are not claims.
- **Modern claims.** Nation-states invoking a medieval polity are out of scope.
  The count is about political succession within the period, not heritage.
- **Conquest without a claim.** Taking the territory is an edge in
  `edges.yaml`, not an influence count.

**Direction.** The count on a polity's record is of polities that claimed
*its* legitimacy — claims pointing *in*, not out. A ruler who takes a
predecessor's title adds to the predecessor's count, not to his own. This is
easy to get backwards when the claiming polity is the more famous one: Mehmed II
taking *Kayser-i Rum* is a claim recorded on Rome and on Byzantium, and the
Ottoman record counts nothing for it.

**Unit of count:** one per claiming *polity*, not per claiming ruler. Four
Ghaznavid sultans styling themselves the same way is one claim.

**Relation to edges.** A successor claim will usually also exist in
`edges.yaml` as a `claimed legitimacy of` edge. The two are kept separately on
purpose: the edge is the narrative link, the count is the tally. Neither is
derived from the other, so a mismatch is a bug worth finding.

---

## 2. Religion carried

> **Counted when the polity actively propagated a religious tradition beyond
> its own prior confessional boundary — by mission, endowment, patronised
> conversion, or conquest followed by institution-building — and a cited source
> describes the propagation.**

Adoption alone does not count. A polity converting is a fact about the polity,
recorded in the prose; carrying is a fact about the polity's effect on
everywhere else, which is what this axis is for.

Included:

- Mission and patronage directed outward: madrasas, khanaqahs, endowed mosques
  established in territory that did not previously hold the tradition.
- Conquest that is followed by durable religious institutions, where a source
  connects the two. Conquest with no institutional follow-through does not
  count.
- Carrying a tradition the polity did not originate. Transmission is the
  measure, not invention.

Excluded:

- The polity's own conversion.
- Continuing an already-established tradition inside already-held territory.
  Maintenance is not propagation.
- Confessional *alignment* used as a political posture with no propagation
  attached — a dynasty being Shi'i while ruling a Sunni population is prose,
  not a count.

**Granularity:** count named traditions at the level a source names them
("Sunni Islam", "Twelver Shi'ism", "Nestorian Christianity"). Do not split a
tradition into schools to inflate a count, and do not merge two the sources
keep apart.

---

## 3. Descendant script

> **Counted when a writing system was derived from, or newly adapted from, the
> polity's writing system, under that polity or through its direct transmission,
> and a cited source describes the derivation.**

Both derivation and adaptation count, but they are different things and both
are named in `items`:

- **Direct derivation** — new letterforms genealogically descended from the
  parent script.
- **Adaptation to a new language** — an existing script extended with new
  letters or conventions to write a language it did not previously write. This
  counts, because adapting a script to a new language is the act that actually
  spreads a writing system, and excluding it would make the axis measure
  palaeography rather than influence.

Excluded:

- **Using a script unchanged.** Writing an existing language in the inherited
  script is not a descendant script. This is the common case in this corpus and
  it is why several polities here honestly score 0.
- **A change of language without a change of script.** Persian written in the
  Perso-Arabic script is a language fact, not a script fact.
- **Script adaptations that a source attributes to a different polity**, even
  where the polity in this corpus was contemporary or adjacent.

---

## Applying these rules to this corpus

A note in advance, so that later readers do not mistake the pattern for an
error: under these rules **most of the Iranian Intermezzo polities score 0 for
descendant scripts.** They all wrote Persian and Arabic in an
already-established Perso-Arabic script that they inherited rather than
extended. That is the honest answer, and an axis reading 0 across seven of
eight polities is information about the corpus, not a failure of the coding.

Likewise, `null` will be common on this axis for polities where no consulted
source addresses transmission at all. Null and zero sit next to each other in
the data and must keep meaning different things.

---

# Part two: turning points

`turning_points` is a short list of dated events that changed a polity's
trajectory. It is the field most likely to decay into a battle list, so the
rules below are stricter than the ones above, and the build enforces several of
them.

> **Recorded when a cited source treats a dated event as having altered what the
> polity was subsequently able to do, and the alteration can be stated in a
> sentence that does not merely restate the event.**

## 4.1 The `changed` test

Every entry carries `changed`, and `changed` must say **what the event
altered**, not what the event was. This is the same discipline `edges.yaml`
holds a `note` to, and it is the whole rule: if the consequence cannot be
written, the entry is not a turning point. It is something that happened, and
things that happened belong in a chapter.

- ✗ "A Byzantine army was defeated by the Seljuks." — restates the event.
- ✓ "Romanos IV was captured and the Anatolian theme system did not recover,
  which opened the interior of the plateau to Turkmen settlement."

The build rejects an empty `changed`, one under sixty characters, and one that
is a copy of the event's name or type. It cannot check that a longer sentence
is a real consequence. That is the author's job, and it is the only part of
this field that matters.

## 4.2 What is excluded

- **Battles that decided nothing.** Military historiography is unevenly
  distributed, and a corpus that admits every well-documented engagement will
  make the well-studied polities look eventful and the rest look quiet. The
  filter is consequence, not documentation.
- **A restatement of what another file already says.** How the polity stopped is
  `ended`. Where the capital sat is `capitals`. `capital-move` is in the
  vocabulary only where a source treats the move itself as the hinge, and it
  does not replace the `capitals` entry.

  **This is not a rule that an event may appear only once.** An edge and a
  turning point make different claims about different things: an edge says what
  passed between two polities, a turning point says what an event did to one
  polity's trajectory, and the same fighting can honestly produce both. The
  original wording of this rule was read strictly enough to keep al-Qadisiyya
  off the Rashidun page on the grounds that the Sasanian conquest was already an
  edge — while the Yarmuk, which is the identical case against Byzantium, was
  admitted. That asymmetry was the rule failing, not the data.

  The test is duplication of content, not of subject matter. If the edge's
  `note` and the turning point's `changed` say the same thing, one of them is
  redundant. Where the edge records a conquest completed in 651 and the turning
  point records what a battle in 636 did to the victor's revenue, they are two
  claims and both belong.
- **Wars, as opposed to events in them.** A turning point is dated to a year. A
  twenty-year war is a period, and the hinge inside it — if a source names one
  — is the entry.
- **Reigns.** "Nasr II's accession" is not an event unless a source treats the
  accession specifically as the hinge.

## 4.3 Absence

**A polity with no turning points is complete.** This follows hard rule 7
exactly, and for the same reason: succession is a property some polities have,
and so is a documented hinge. Srivijaya's power was a standing arrangement over
a strait rather than a sequence of decisive days, and the Rustamids' hundred and
thirty years are recorded mainly through doctrine and commerce. Neither page is
missing anything, and neither renders a gap — an empty list produces one plain
sentence, never a pending item.

The corresponding warning: **do not add a thin entry to avoid an empty
section.** An empty list is a true statement; a padded one is a false one, and
it is false in the direction that makes the site look more complete than it is.

## 4.4 Contested

`contested: true` where scholarship disputes that the event was a hinge, not
where it disputes the date or the details. The Samye debate is recorded as a
turning point and marked contested because whether it happened as a single
event is doubted, while the direction of the choice is not.

## 4.5 Unit and ordering

One entry per event, in year order, at most a handful per polity. If a polity
accumulates more than about five, the list has started describing the polity's
history rather than its hinges, and the surplus belongs in a chapter.

---

# Part three: institutions

Four coded sets per polity: **military basis**, **revenue basis**, **succession
rule**, **legitimation**. Each is a set of values from a closed vocabulary with
one source for the coding, and each is independently `null`.

These are the comparative substance that extent cannot carry. Two empires of the
same size that raised their armies differently were different things, and the
point of coding them is that a reader can see the pattern across sixty polities
instead of finding it four times in prose.

Four standing requirements:

1. **Code the arrangement in force for most of the polity's life**, and add a
   second value where a source describes a real change or a genuine duality —
   the Safavids replaced a tribal army with a slave one inside a century, and
   the Liao ran two administrations at once. Do not add a second value for a
   brief experiment or a single ruler's preference.
2. **A set is never empty.** An empty list would assert that the polity had no
   army, no revenue or no succession. Where no consulted source addresses the
   question the whole field is `null`, and it renders as a gap.
3. **Code what the source describes, not what the label suggests.** The
   vocabularies use terms that carry baggage from European history. `land-grant`
   covers iqta', timar and jagir; it does not import feudalism, and nothing
   should be coded from an analogy.
4. **The same rules apply to polities outside this corpus's centre of gravity.**
   The vocabularies were built on a corpus that is heavily Islamic and Iranian.
   When an East Asian, African or maritime polity does not fit, the answer is
   `null` or a vocabulary change argued on the merits — never the nearest
   familiar label.

## 5. Military basis

> **How the fighting force was raised**, not how it fought or where.

| Value | Coded when |
| --- | --- |
| `tribal-levy` | Contingents raised through kin or tribal structures the ruler did not create |
| `client-levy` | Contingents owed by subordinate chiefs or vassals under an obligation |
| `conscript` | Levied from a settled population by administrative obligation |
| `land-grant` | Service in return for assigned revenue — iqta', timar, jagir |
| `slave-soldier` | Purchased unfree troops attached to the ruler personally |
| `mercenary` | Hired for pay, with no standing obligation either way |
| `standing-professional` | Paid, permanent, recruited and commanded centrally |

Excluded: naval force. A fleet is a domain a state operates in, and the men on
it were raised one of the ways above like everyone else. Srivijaya's crews came
from coastal chiefs under obligation, which is `client-levy`; that they went to
sea is on its page in prose, where it belongs.

`mercenary` and `slave-soldier` are distinguished by whether the soldier could
leave. Daylamite infantry hiring themselves out to whoever was paying are
mercenaries; a Turkish ghulam bought as a boy is not, and the difference is
exactly what the Buyid page turns on.

## 6. Revenue basis

> **What the state lived on**, as its sources describe it.

`land-tax`, `poll-tax`, `trade-toll`, `tribute`, `plunder`, `mining`,
`monopoly`.

- `tribute` is revenue *received* from another polity. Payment made to someone
  else is not a revenue basis, and the Song paying the Liao appears here on the
  Liao record only.
- `plunder` is coded only where a source treats campaign proceeds as a
  structural part of the state's income, not merely as something armies did.
- `trade-toll` covers customs, straits dues and caravan levies together. The
  distinction between them is a matter for prose.
- Where a source describes the mix without ranking it, code the set unranked.
  **Do not order the values by importance** — the field has no way to express
  rank, and an ordered-looking list would smuggle in a judgement.

## 7. Succession rule

> **The rule in force, not the outcome.** A polity with a clear rule that was
> repeatedly violated is coded by the rule.

`primogeniture`, `tanistry` (lateral seniority within the house), `appanage`
(patrimonial division among heirs), `nomination` (a designated heir),
`election`, `acclamation` (by army or assembly), `factional`.

`factional` is a real coding and not a disguised null. The Mamluk sultanate had
no succession rule and a throne that went to whichever military faction could
impose its man; recording that as unaddressed would lose the most distinctive
thing about the polity. Use it only where a source describes the *absence* of a
rule, never where a source is simply silent.

## 8. Legitimation

> **On what public ground the right to rule was asserted**, in the polity's own
> self-description.

`descent`, `divine-sanction`, `conquest`, `caliphal-investiture`, `investiture`,
`titulature`, `election`.

- The test is publicity, as in section 1: what was said on coins, in the khutba,
  in titles and in chancery documents — not what a modern account infers.
- `titulature` here means taking a *predecessor's* title as one's own ground.
  Where it is coded, there is very often a successor claim counted on the
  predecessor's record, and the two should agree. A disagreement is worth
  finding.
- `divine-sanction` covers the mandate of heaven, divine kingship, and a claim
  to be mahdi or imam. These are different theologies and the same move: the
  right comes from above rather than from a predecessor, a lineage or an army.
- `caliphal-investiture` is separated from `descent` and `titulature` because it
  is the characteristic move of half this corpus, and collapsing it into a
  general category would hide the pattern the site exists to show.
- **`investiture` is the genus and `caliphal-investiture` the species.** Code
  `investiture` where the ruler's public claim rests on a grant of authority
  from an external sovereign who is not a caliph — an emperor, a khan, a shah, a
  sultan, a jurist, or a treaty between two other powers. Code
  `caliphal-investiture`, and not the general value as well, where the granting
  authority is a caliph.

  **Who conferred it is prose, not vocabulary.** This is the point on which the
  value was argued about for a long time, so it is written down: the objection
  was that a single `investiture` cannot distinguish a Roman client kingship
  from a Mongol yarligh from an Ottoman berat. It cannot, and neither can any
  other value in this list. `descent` does not name the ancestor. `conquest`
  does not name the conquered. `divine-sanction` does not name the god. The
  field records the *kind* of ground claimed; the counterparty goes in the
  chapters and the sources, where it can be argued instead of asserted.

  The test is the same publicity test as everything else in this section. A
  ruler who happened to hold a patent from somebody is not coded `investiture`;
  a ruler who put the granting sovereign's name on his coins, in the khutba, in
  his titles or in his chancery documents is. Where a source describes a grant
  and nothing shows the recipient invoking it, that is prose.

  **A grant that a later source calls a formality still counts.** The 1517
  transfer of the caliphate to the Ottomans, the Abbasid diplomas the Buyids
  collected while holding the caliph prisoner, and the Safavid children the Zand
  kept on the throne are all cases where the conferring authority was
  powerless. Rule 1 counts unrecognised claims on the ground that the count
  measures whose legitimacy was worth claiming; the same reasoning applies here.
  What is coded is that the ruler thought the grant was worth having.

## 9. What coding these fields will look like

Most polities will carry some fields and not others for a long time. That is the
expected state and not a backlog: coding requires a source that addresses the
question, and a work that is excellent on a dynasty's army is often silent on
how its succession was supposed to work. Four gaps on a page is an honest page.

The failure to watch for is the opposite one. These vocabularies are small
enough that every polity *can* be given four plausible values from general
knowledge in about a minute, and the result would be uniform, complete, and
entirely unsourced. Coding rule 3 in part one applies here with full force: a
value without a source that addresses the question is not enterable.
