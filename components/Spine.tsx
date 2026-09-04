import { PHASES, ASIDE, arcIndex, type Chapter, type Phase } from '@/lib/types'

/**
 * Where a polity's chapters sit in its life.
 *
 * The arc is drawn in full, every time, and the positions with no chapter are
 * drawn too — but they are not gaps and must never read as ones. Hard rule 7's
 * logic applies here as much as it does to succession: a polity that has no
 * contraction chapter may have had no contraction worth a chapter, or may be
 * one nobody has drafted yet, and the site cannot tell those apart. So an
 * unfilled position asserts nothing. It is the empty half of a shape, shown so
 * the filled half means something.
 *
 * The alternative — drawing only the phases that exist — was worse: four marks
 * in a row look identical whether they are formation-to-end or four peaks, and
 * the reader has no way to see that the Ghurids' chapters cover their whole
 * span while the Byzantines' cover the seventh century.
 */

const PHASE_BLURB: Record<Phase, string> = {
  formation: 'How it came to exist',
  expansion: 'While it was still taking',
  peak: 'At its greatest extent or reach',
  contraction: 'Losing what it had held',
  end: 'How it stopped',
  afterlife: 'What outlasted it',
}

export function Spine({ chapters }: { chapters: Chapter[] }) {
  // First chapter at each arc position — the link target. Later ones at the
  // same position are reachable from the contents list.
  const atPhase = new Map<Phase, Chapter>()
  const counts = new Map<Phase, number>()
  for (const c of chapters) {
    if (arcIndex(c.phase) === null) continue
    const p = c.phase as Phase
    if (!atPhase.has(p)) atPhase.set(p, c)
    counts.set(p, (counts.get(p) ?? 0) + 1)
  }

  const asides = chapters.filter((c) => c.phase === ASIDE)
  if (atPhase.size === 0 && asides.length === 0) return null

  const filled = atPhase.size

  return (
    <nav aria-label="Chapter spine" className="mt-8">
      <ol className="flex flex-wrap gap-x-1 gap-y-3">
        {PHASES.map((phase) => {
          const chapter = atPhase.get(phase)
          const extra = (counts.get(phase) ?? 0) - 1
          const label = (
            <>
              <span
                aria-hidden
                className={`block h-1 rounded-full ${
                  chapter ? 'bg-kashi' : 'bg-kashi/15'
                }`}
              />
              <span
                className={`mt-2 block font-mono text-micro uppercase tracking-[0.08em] ${
                  chapter ? 'text-kashi' : 'text-debu-ink/55'
                }`}
              >
                {phase}
                {extra > 0 ? <span className="tabular-nums"> ·{extra + 1}</span> : null}
              </span>
            </>
          )

          return (
            <li key={phase} className="min-w-[92px] flex-1">
              {chapter ? (
                <a
                  href={`#${chapter.slug}`}
                  title={`${PHASE_BLURB[phase]} — ${chapter.title}`}
                  className="group block rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-firuze-ink"
                >
                  {label}
                  <span className="mt-1 block max-w-[22ch] text-[13.5px] leading-snug text-dawat/75 group-hover:text-firuze-ink">
                    {chapter.title}
                  </span>
                </a>
              ) : (
                // No chapter here. Deliberately not labelled "missing": see
                // the note at the top of this file.
                <div className="block">
                  {label}
                  <span className="sr-only">no chapter at this phase</span>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <p className="mt-5 max-w-measure text-[14px] leading-relaxed text-debu-ink">
        {filled === PHASES.length
          ? 'These chapters cover the whole arc.'
          : `These chapters cover ${filled} of the ${PHASES.length} phases of the arc.`}{' '}
        A phase with no chapter is not a gap in the record: the arc is a way of
        reading, not a shape every polity had, and this site does not write a
        chapter to fill one.
        {asides.length ? (
          <>
            {' '}
            {asides.length === 1 ? 'One chapter stands' : `${asides.length} chapters stand`} outside
            the arc entirely
            {asides.length === 1 ? (
              <>
                {' — '}
                <a
                  href={`#${asides[0].slug}`}
                  className="link-underline text-kashi hover:text-firuze-ink"
                >
                  {asides[0].title}
                </a>
              </>
            ) : null}
            .
          </>
        ) : null}
      </p>
    </nav>
  )
}
