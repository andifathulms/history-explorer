import type { Metadata } from 'next'
import Link from 'next/link'
import { loadCorpus, getPolity } from '@/lib/content'
import { buildField, rate, DEFAULT_WEIGHTS } from '@/lib/ratings'
import { Page, Shell, PageHero } from '@/components/Shell'
import { PageNav, type NavSection } from '@/components/PageNav'

export const metadata: Metadata = {
  title: 'About',
  description: 'How this site was made, how the chapters were drafted, and what the numbers are not.',
}

export default function About() {
  const corpus = loadCorpus()
  const { sources, narrative, backdrop, edges } = corpus

  /**
   * The Ghurid example, counted rather than asserted.
   *
   * This paragraph said the Ghurids "have three empty axes" while their own
   * page said "computed from 2 of 4 axes" — reach and population are null,
   * longevity and influence are not. It is the same failure as the timeline's
   * "five acts" against a six-phase arc: a number written into prose once and
   * never taught to check itself. It reads the rating now, so the day a
   * Ghurid extent figure is entered the sentence corrects itself.
   */
  const sections: NavSection[] = [
    { id: 'thread-heading', label: 'One section' },
    { id: 'drafting-heading', label: 'How it was written' },
    { id: 'numbers-heading', label: 'The numbers' },
    { id: 'not-heading', label: 'What this is not' },
    { id: 'sources-heading', label: 'Sources' },
  ]

  const ghurid = getPolity('ghurid')
  const ghuridEmpty = ghurid
    ? (() => {
        const field = buildField(corpus.narrative, corpus.backdrop, 'absolute', corpus.denominators)
        const r = rate(ghurid, field, DEFAULT_WEIGHTS, 'absolute', corpus.denominators)
        return r.axesTotal - r.axesAvailable
      })()
    : 0

  return (
    <Page ground="paper" nav="dark" current="About">
      <PageHero kicker="Method, limits, sources" title="About">
        <p>
          History Explorer is a reading site about polities — what they were, how far
          they reached, how long they lasted, and what they left behind. It is built
          around one constraint: every claim carries the work it came from, and where no
              figure exists the gap is drawn rather than filled.
            </p>
      </PageHero>
      <Shell className="flex-1 pb-24">
        <div className="flex gap-12">
          <aside className="hidden shrink-0 pt-12 lg:block lg:w-[224px]">
            <div className="sticky top-24">
              <PageNav sections={sections} />
            </div>
          </aside>

          <main id="main" className="min-w-0 flex-1">

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2
            id="thread-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            Why succession is only one section
          </h2>
          <p className="mt-4 text-body">
            The site began as a single thread through the Iranian Intermezzo, where one
            polity really does become the next with unusual density — slave-generals
            taking their masters&rsquo; provinces, governors inheriting the empire that
            appointed them. That thread is still here, and it is still the part that no
            reference work gives you.
          </p>
          <p className="mt-4 text-body">
            But most of history is not a thread. Rome, Srivijaya, Aksum and the Inca have
            no succession relationship to the Samanids and never will. All four are here,
            with full pages and full rankings, and a site organised around continuity
            would have had to either leave them out or invent a connection. So continuity
            became a section rather than the spine. A polity
            that seceded from nothing and was inherited by nobody gets a full page and a
            full ranking here, and simply has no thread to stand in — which the page says
            in one sentence, as a fact about what has been read rather than a hole in the
            record.
          </p>
        </section>

        {/* PRD section 9. The standing note, in plain words, not a disclaimer
            in small type at the bottom. */}
        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2
            id="drafting-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            How the chapters were written
          </h2>
          <p className="mt-4 text-body">
            The chapters on this site were drafted by an AI model and reviewed by the
            person who runs the site. That is a deliberate trade-off, and the honest
            alternative was not a hand-written version of this site — it was no site at
            all.
          </p>
          <p className="mt-4 text-body">
            What limits the damage is the method. Drafting is done one polity at a time,
            against a named source that is opened first, and that source is printed at
            the top of every chapter where you can see it before you read a word of the
            prose. Nothing is drafted from several sources at once or from general
            recall, because that is precisely how unsourced claims get in.
          </p>
          <p className="mt-4 text-body">
            So: this is a set of structured reading notes with visible provenance. It is
            not generated content presented as authority, and it is not a substitute for
            the works it cites. Where a chapter says something you want to rely on, the
            source line above it is the thing to go and read.
          </p>
        </section>

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2
            id="numbers-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            What the numbers are, and are not
          </h2>
          <p className="mt-4 text-body">
            No figure on this site is estimated, interpolated, or inferred. Where two
            sources disagree, both are kept and the range is shown — which is why several
            longevity bars are ranges rather than lines. Where no citable figure exists,
            the axis reads <em>No cited figure</em>, is excluded from the weighted total,
            and is never quietly treated as zero.
          </p>
          <p className="mt-4 text-body">
            That last rule matters more than it looks. A polity with two documented axes
            must never appear to score lower than one with four, so every total states
            how many axes it was computed from and is renormalised across those only. The
            Ghurids produced the Delhi Sultanate and have{' '}
            {ghuridEmpty === 1 ? 'one empty axis' : `${ghuridEmpty} empty axes`}; the empty
            bars are a fact about what scholarship has bothered to quantify, and they are
            content rather than an apology.
          </p>
          <p className="mt-4 text-body">
            Influence is never published as a single number. It is three separate counts —
            descendant scripts, religions carried, successor claims — coded against a
            written rulebook that is applied to every polity including the ones where the
            answer is inconvenient. The sliders on the rankings view will fuse those
            three if you want them fused, in your view, and the result travels in the
            address bar rather than being published as this site&rsquo;s opinion.
          </p>
        </section>

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2
            id="not-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            What this is not
          </h2>
          <ul className="mt-4 list-disc space-y-2 ps-5 text-body marker:text-kashi/50">
            <li>Not a wiki. No editing, no accounts, no contributions. Corrections are
              made by editing files in the repository and redeploying.</li>
            <li>Not a ranking. There is no greatest-empire ordering published here as the
              site&rsquo;s own view.</li>
            <li>Not complete. Coverage follows one person&rsquo;s curiosity and grows one
              polity at a time, each drafted against a source that is opened first.</li>
            <li>Not a claim that the regions here were separate worlds. A region is a
              browsing group and the boundary of a thread, nothing more.</li>
          </ul>
        </section>

        {/* The list itself lives on /sources/, where each work carries what
            rests on it. It used to be printed here as well — the same 550
            entries a second time, which made this page, whose subject is
            method and limits, about ninety per cent bibliography by weight and
            gave a reader who landed here no reason to suspect the other page
            existed. */}
        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2
            id="sources-heading"
            className="font-display text-title font-semibold text-kashi-deep"
          >
            Sources
          </h2>
          <p className="mt-4 text-body">
            Every citation on this site resolves to a work in one list, and the build
            fails if one does not. {sources.size} works, cited across {narrative.length}{' '}
            narrative polities, {backdrop.length} reference polities and {edges.length}{' '}
            succession edges.
          </p>
          <p className="mt-4 text-body">
            <Link
              href="/sources/"
              className="link-underline font-semibold text-kashi hover:text-firuze-ink"
            >
              The full bibliography
            </Link>{' '}
            shows each work with the number of claims resting on it, the polities that
            rest on it, and the ones where a single book carries an entire page.
          </p>
        </section>
          </main>
        </div>
      </Shell>
    </Page>
  )
}
