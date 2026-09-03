import Link from 'next/link'
import { loadCorpus, getChapters } from '@/lib/content'
import { Page, Shell, StatRow } from '@/components/Shell'
import { CorpusSpans } from '@/components/CorpusSpans'
import { formatYear } from '@/lib/years'

/**
 * The front door is a hub, not the thread.
 *
 * The thread used to be the landing view, which made continuity look like the
 * whole product. It is one section. A polity with no succession relationship to
 * anything else on the site is a first-class citizen here, so the home page
 * leads with the corpus and lists the ways in.
 *
 * What the page does now that it did not before is *show* the constraint rather
 * than only state it. The figure under the headline is every polity drawn as a
 * span on one axis: same bars as the timeline, same rule that length is a cited
 * quantity. It is the site's grammar, not an illustration of it.
 */
export default function Home() {
  const { regions, narrative, context, all, backdrop, edges, sources } = loadCorpus()
  const chapters = narrative.reduce((n, p) => n + getChapters(p.id).length, 0)
  const threaded = regions.filter((r) => r.thread)
  const first = Math.min(...all.map((p) => p.span.start.min))
  const last = Math.max(...all.map((p) => p.span.end.max))

  const sections = [
    {
      href: '/polities/',
      title: 'Polities',
      count: `${narrative.length} with chapters`,
      body: 'Chapters, facts, a peak-extent map and a rating panel. Drafted one at a time against a named source, which is printed above the prose rather than filed in a footnote.',
    },
    {
      href: '/rankings/',
      title: 'Rankings',
      count: `${backdrop.length} in the backdrop`,
      body: 'Reach, longevity, population and influence, measured against the largest states in world history so a percentile is a true statement. Weighted by sliders you set, never by the site.',
    },
    {
      href: '/continuity/',
      title: 'Continuity',
      count: `${edges.length} sourced edges`,
      body: 'How one polity became the next, typed and dated and cited — the thing that lives between encyclopaedia articles rather than inside them. Not every polity has one, and that is ordinary.',
    },
    {
      href: '/timeline/',
      title: 'Timeline',
      count: `${formatYear(first)} – ${formatYear(last)}`,
      body: 'Every span drawn on one axis, so concurrency and overlap are visible rather than asserted. Soft bar ends where the sources disagree about when something started or stopped.',
    },
    {
      href: '/endings/',
      title: 'Endings',
      count: 'Six types, closed',
      body: 'How polities stopped, typed from a vocabulary fixed before most of this corpus existed so the tally was not shaped to fit the answer. Half were ended by an outside power.',
    },
    {
      href: '/sources/',
      title: 'Sources',
      count: `${sources.size} works`,
      body: 'Every work cited, what rests on it, and which polities lean on a single book. The build proves the citations resolve; this page shows how they are distributed.',
    },
  ]

  return (
    <Page ground="dark" current="Home" wash>
      <main id="main" className="flex-1">
        <Shell className="pb-4 pt-16 sm:pt-20">
          <p className="kicker text-firuze-bright">A reading site about polities</p>
          <h1 className="mt-6 max-w-[15ch] font-display text-hero font-semibold text-kaghaz">
            What empires were, and what can actually be said about them
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <p className="max-w-measure text-lede text-kaghaz/85">
              How far each one reached, how long it lasted, how many people it held, what
              it left behind — and, where a source says so, how one became the next.
            </p>
            <p className="max-w-measure text-[17px] leading-relaxed text-debu-paper">
              The constraint the whole site is built around: nothing here is estimated.
              Every figure carries the work it came from, and where no figure exists the
              gap is drawn rather than filled. An empty bar next to three full ones is the
              honest picture, and it is meant to look intentional.
            </p>
          </div>

          <CorpusSpans polities={all} />

          <StatRow
            ground="dark"
            stats={[
              { value: narrative.length, label: 'Polities read' },
              { value: chapters, label: 'Chapters' },
              { value: edges.length, label: 'Sourced edges' },
              { value: sources.size, label: 'Works cited' },
            ]}
          />
        </Shell>

        <Shell className="py-16 sm:py-20">
          <h2 className="kicker text-debu-paper">Six ways in</h2>
          <ul className="mt-8 grid gap-px border border-dawat-edge bg-dawat-edge sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s, i) => (
              <li key={s.href} className="bg-dawat">
                <Link
                  href={s.href}
                  className="group flex h-full flex-col p-7 transition-colors hover:bg-dawat-raise"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[26px] font-semibold text-kaghaz transition-colors group-hover:text-firuze-bright">
                      {s.title}
                    </h3>
                    <span className="font-mono text-micro uppercase text-debu-paper">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-micro uppercase text-firuze">{s.count}</p>
                  <p className="mt-4 text-[16px] leading-relaxed text-debu-paper">{s.body}</p>
                  <span
                    aria-hidden="true"
                    className="mt-6 font-mono text-micro uppercase text-kaghaz/45 transition-colors group-hover:text-firuze-bright"
                  >
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Shell>

        <Shell className="pb-24">
          {/* Two columns, because one paragraph set at reading measure across a
              1240px shell leaves half the page empty and reads as an
              afterthought. What the corpus holds on the left, what it does not
              claim on the right. */}
          <div className="grid gap-x-16 gap-y-8 border-t border-dawat-edge pt-10 md:grid-cols-2">
            <div>
              <h2 className="kicker text-debu-paper">What is in it so far</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-kaghaz/80">
                {narrative.length} polities across {chapters} chapters
                {context.length ? `, plus ${context.length} more carried for context` : ''}, in{' '}
                {regions.length === 1 ? 'one region' : `${regions.length} regions`}
                {threaded.length ? (
                  <>
                    {' '}
                    — {threaded.length} of which
                    {threaded.length === 1 ? ' carries a thread' : ' carry threads'}
                  </>
                ) : null}
                . Every claim resolves to one of {sources.size} listed works, and the build
                refuses to ship a citation that does not.
              </p>
            </div>
            <div>
              <h2 className="kicker text-debu-paper">What it does not claim</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-kaghaz/80">
                Coverage follows one person&rsquo;s curiosity and makes no attempt at
                completeness, the regions are browsing groups rather than civilisations,
                and no ordering here is published as this site&rsquo;s own verdict. The{' '}
                <Link href="/about/" className="link-underline text-firuze-bright">
                  About page
                </Link>{' '}
                says all of that plainly, along with how the chapters were drafted and what
                that costs.
              </p>
            </div>
          </div>
        </Shell>
      </main>
    </Page>
  )
}
