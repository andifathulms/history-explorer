import type { Metadata } from 'next'
import { loadCorpus } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'

export const metadata: Metadata = {
  title: 'About',
  description: 'How this site was made, what it is not, and every source it cites.',
}

export default function About() {
  const { sources, narrative, backdrop, edges } = loadCorpus()
  const list = [...sources.values()].sort((a, b) =>
    (a.author ?? a.title).localeCompare(b.author ?? b.title),
  )

  return (
    <Page ground="paper" current="About">
      <main id="main" className="flex-1">
        <Shell className="pb-24">
          <PageHead kicker="Method, limits, sources" title="About" ground="paper">
            <p>
          History Explorer is a reading site about polities — what they were, how far
          they reached, how long they lasted, and what they left behind. It is built
          around one constraint: every claim carries the work it came from, and where no
              figure exists the gap is drawn rather than filled.
            </p>
          </PageHead>

        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
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
            no succession relationship to the Samanids and never will, and a site
            organised around continuity would have to either exclude them or invent a
            connection. So continuity became a section rather than the spine. A polity
            that seceded from nothing and was inherited by nobody gets a full page and a
            full ranking here, and simply has no thread to stand in — which the page says
            in one sentence, as a fact about what has been read rather than a hole in the
            record.
          </p>
        </section>

        {/* PRD section 9. The standing note, in plain words, not a disclaimer
            in small type at the bottom. */}
        <section className="mt-16 max-w-measure border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">
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
          <h2 className="font-display text-title font-semibold text-kashi-deep">
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
            Ghurids produced the Delhi Sultanate and have three empty axes; the empty bars
            are a fact about what scholarship has bothered to quantify, and they are
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
          <h2 className="font-display text-title font-semibold text-kashi-deep">
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

        <section className="mt-16 border-t border-kashi/15 pt-8">
          <h2 className="font-display text-title font-semibold text-kashi-deep">Sources</h2>
          <p className="mt-4 max-w-measure text-body">
            Every citation on this site resolves to an item in this list, and the build
            fails if one does not. {list.length} works, cited across {narrative.length}{' '}
            narrative polities, {backdrop.length} reference polities and {edges.length}{' '}
            succession edges.
          </p>
          <ul className="mt-8 grid gap-x-12 gap-y-0 lg:grid-cols-2">
            {list.map((s) => (
              <li key={s.id} className="border-t border-kashi/12 py-4">
                <p>
                  {s.author ? <span>{s.author}, </span> : null}
                  <cite className="italic">{s.title}</cite>
                  {s.container ? <span>, in {s.container}</span> : null}
                  {s.edition ? <span>, {s.edition} edn</span> : null}
                  {s.publisher ? <span> ({s.publisher}</span> : null}
                  {s.publisher && s.year ? <span>, {s.year})</span> : s.publisher ? <span>)</span> : s.year ? <span> ({s.year})</span> : null}
                  {s.url ? (
                    <>
                      {' '}
                      <a
                        href={s.url}
                        rel="noreferrer"
                        className="text-kashi underline underline-offset-2 hover:text-firuze-ink"
                      >
                        link
                      </a>
                    </>
                  ) : null}
                </p>
                {s.note ? <p className="mt-1 text-[15px] text-debu-ink">{s.note}</p> : null}
                <p className="mt-1.5 font-mono text-micro text-debu-ink">{s.id}</p>
              </li>
            ))}
          </ul>
        </section>
        </Shell>
      </main>
    </Page>
  )
}
