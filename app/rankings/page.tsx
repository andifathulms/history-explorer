import type { Metadata } from 'next'
import { loadCorpus } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { Comparison } from '@/components/Comparison'

export const metadata: Metadata = {
  title: 'Rankings',
  description:
    'Every polity measured on cited figures only, ranked by weights you set yourself.',
}

export default function RankingsView() {
  const { narrative, backdrop, denominators } = loadCorpus()

  return (
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="Rankings" />
      <main id="main" className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">Rankings</h1>
        <p className="mt-3 max-w-measure text-body">
          Reach, longevity, population and influence — every polity on the site, measured
          against a reference set of the largest states in world history so that a
          percentile is a true statement rather than a comparison against eight things.
        </p>
        <p className="mt-4 max-w-measure text-body">
          The ordering is a function of the sliders, which start even and are yours to
          move. No arrangement of them is the site&rsquo;s own opinion, and none is
          published as a greatest-empire ordering. The weights travel in the address bar,
          so you can send someone a view rather than an argument.
        </p>
        <p className="mt-4 max-w-measure text-body">
          Every polity is eligible here, whether or not it stands in a succession thread.
          Measurement does not require a predecessor.
        </p>
        <Comparison narrative={narrative} backdrop={backdrop} denominators={denominators} />
      </main>
    </div>
  )
}
