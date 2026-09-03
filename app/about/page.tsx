import type { Metadata } from 'next'
import { loadCorpus } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'

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
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="About" />
      <main id="main" className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">About</h1>

        {/* PRD section 9. The standing note, in plain words, not a disclaimer
            in small type at the bottom. */}
        <section className="mt-8 max-w-measure">
          <h2 className="text-[22px] text-kashi">How the chapters were written</h2>
          <p className="mt-3 text-body">
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

        <section className="mt-12 max-w-measure">
          <h2 className="text-[22px] text-kashi">What the numbers are, and are not</h2>
          <p className="mt-3 text-body">
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

        <section className="mt-12 max-w-measure">
          <h2 className="text-[22px] text-kashi">What this is not</h2>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-body">
            <li>Not a wiki. No editing, no accounts, no contributions. Corrections are
              made by editing files in the repository and redeploying.</li>
            <li>Not a ranking. There is no greatest-empire ordering published here as the
              site&rsquo;s own view.</li>
            <li>Not complete. Coverage follows one person&rsquo;s curiosity, and stops at
              eight polities in one region over four hundred years.</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-[22px] text-kashi">Sources</h2>
          <p className="mt-3 max-w-measure text-body">
            Every citation on this site resolves to an item in this list, and the build
            fails if one does not. {list.length} works, cited across {narrative.length}{' '}
            narrative polities, {backdrop.length} reference polities and {edges.length}{' '}
            succession edges.
          </p>
          <ul className="mt-5 space-y-3">
            {list.map((s) => (
              <li key={s.id} className="max-w-measure border-t border-kashi/15 pt-3">
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
                <p className="mt-1 font-mono text-[13px] text-debu-ink">{s.id}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
