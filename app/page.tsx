import Link from 'next/link'
import { loadCorpus, getChapters } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'

/**
 * The front door is a hub, not the thread.
 *
 * The thread used to be the landing view, which made continuity look like the
 * whole product. It is one section. A polity with no succession relationship to
 * anything else on the site is a first-class citizen here, so the home page
 * leads with the polities and lists the ways in.
 */
export default function Home() {
  const { regions, narrative, backdrop, edges, sources } = loadCorpus()
  const chapters = narrative.reduce((n, p) => n + getChapters(p.id).length, 0)
  const threaded = regions.filter((r) => r.thread)

  const sections = [
    {
      href: '/polities/',
      title: 'Polities',
      body: `${narrative.length} polities with chapters, facts, a peak-extent map and a rating panel. Drafted one at a time against a named source, which is printed above the prose.`,
    },
    {
      href: '/rankings/',
      title: 'Rankings',
      body: `Reach, longevity, population and influence, measured against ${backdrop.length} of the largest states in world history. Weighted by sliders you set, never by the site's opinion.`,
    },
    {
      href: '/continuity/',
      title: 'Continuity',
      body: `${edges.length} typed, dated, cited succession edges — how one polity became the next, where a source says it did. Not every polity has one.`,
    },
    {
      href: '/timeline/',
      title: 'Timeline',
      body: 'Every span drawn on one axis, so concurrency and overlap are visible rather than asserted.',
    },
    {
      href: '/endings/',
      title: 'Endings',
      body: 'How polities stopped, typed from a closed list of six so it can be counted. Half were ended by an outside power; the other half came apart on their own.',
    },
    {
      href: '/sources/',
      title: 'Sources',
      body: `Every work cited, what rests on it, and which polities depend on a single book. The build proves the citations resolve; this shows how they are distributed.`,
    },
  ]

  return (
    <div className="min-h-screen bg-dawat text-kaghaz">
      <SiteNav ground="dark" current="Home" />
      <main id="main" className="px-5 pb-24 pt-12 sm:px-8">
        <header className="max-w-measure">
          <h1 className="text-[34px] leading-tight text-kaghaz">
            What empires were, and what can actually be said about them
          </h1>
          <p className="mt-5 text-debu-paper">
            A reading site about polities: how far each one reached, how long it lasted,
            how many people it held, what it left behind — and, where a source says so,
            how one became the next.
          </p>
          <p className="mt-4 text-debu-paper">
            The constraint the whole site is built around: nothing here is estimated. Every
            figure carries the work it came from, and where no figure exists the gap is
            drawn rather than filled. An empty bar next to three full ones is the honest
            picture.
          </p>
        </header>

        <nav aria-label="Sections" className="mt-14">
          <ul className="grid max-w-[900px] gap-px border border-kashi/40 bg-kashi/40 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.href} className="bg-dawat">
                <Link href={s.href} className="group block h-full p-6">
                  <h2 className="text-[22px] text-kaghaz group-hover:text-firuze">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-debu-paper">{s.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="mt-16 max-w-measure">
          <h2 className="text-[13px] uppercase tracking-[0.14em] text-debu-paper">
            What is in it so far
          </h2>
          <p className="mt-4 text-debu-paper">
            {narrative.length} polities across {chapters} chapters, in{' '}
            {regions.length === 1 ? 'one region' : `${regions.length} regions`}
            {threaded.length ? (
              <>
                {' '}
                — {threaded.map((r) => r.name).join(', ')}
                {threaded.length === 1 ? ', which carries a thread' : ', which carry threads'}
              </>
            ) : null}
            . Every claim resolves to one of {sources.size} listed works. Coverage follows
            one person&rsquo;s curiosity and makes no attempt at completeness; the site says
            so on its <Link href="/about/" className="text-firuze hover:underline">About</Link>{' '}
            page, along with how the chapters were drafted.
          </p>
        </section>
      </main>
    </div>
  )
}
