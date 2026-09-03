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
              Reach, longevity, population and influence — every polity on the site,
              measured against {backdrop.length} of the largest states in world history so
              that a percentile is a true statement rather than a comparison against eight
              things.
            </p>
          </PageHead>

          <div className="mt-8 grid max-w-[74rem] gap-x-12 gap-y-4 text-[16px] leading-relaxed text-debu-ink md:grid-cols-2">
            <p>
              The ordering is a function of the sliders, which start even and are yours to
              move. No arrangement of them is the site&rsquo;s own opinion, and none is
              published as a greatest-empire ordering. The weights travel in the address
              bar, so you can send someone a view rather than an argument.
            </p>
            <p>
              Every polity is eligible here, whether or not it stands in a succession
              thread — measurement does not require a predecessor. A missing axis leaves
              its bar empty and is excluded from the total rather than counted as zero.
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
