import type { Metadata } from 'next'
import { loadCorpus } from '@/lib/content'
import { Page, Shell, PageHead } from '@/components/Shell'
import { Comparison } from '@/components/Comparison'

export const metadata: Metadata = {
  title: 'Rankings',
  description:
    'Every polity measured on cited figures only, ranked by weights you set yourself.',
}

export default function RankingsView() {
  const { narrative, backdrop, denominators } = loadCorpus()

  return (
    <Page ground="paper" current="Rankings">
      <main id="main" className="flex-1">
        {/* The heading stays on the site's grid, aligned with the nav; only the
            data block below bleeds wider. A whole page shifted left would read
            as a different site rather than as a wide table. */}
        <Shell>
          <PageHead kicker="Measured, not judged" title="Rankings" ground="paper">
            <p>
              Five boards over one corpus, measured against {backdrop.length} of the
              largest states in world history so that a position is a true statement
              rather than a comparison against eight things. Largest and longest are
              different questions, and this page answers them separately rather than
              handing you their average.
            </p>
          </PageHead>

          <div className="mt-8 grid max-w-[74rem] gap-x-12 gap-y-4 text-[16px] leading-relaxed text-debu-ink md:grid-cols-2">
            <p>
              Two of the five boards fuse anything at all, and both are functions of your
              sliders rather than of the site&rsquo;s opinion. Nothing here is published
              as a greatest-empire ordering. The board, the sliders, the scale and the
              choice between percentile and log magnitude all travel in the address bar,
              so you can send someone a view rather than an argument.
            </p>
            <p>
              Every polity is eligible here, whether or not it stands in a succession
              thread — measurement does not require a predecessor. A missing axis leaves
              its bar empty and is excluded from the total rather than counted as zero,
              and a polity a board cannot order sits below that board rather than at the
              bottom of it.
            </p>
          </div>

        </Shell>

        <Shell wide className="pb-24">
          <Comparison narrative={narrative} backdrop={backdrop} denominators={denominators} />
        </Shell>
      </main>
    </Page>
  )
}
