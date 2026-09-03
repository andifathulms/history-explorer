import type { Metadata } from 'next'
import { loadCorpus } from '@/lib/content'
import { SiteNav } from '@/components/SiteNav'
import { Comparison } from '@/components/Comparison'

export const metadata: Metadata = {
  title: 'Comparison',
  description:
    'The ranked table with reader weight sliders, against a global reference set.',
}

export default function ComparisonView() {
  const { narrative, backdrop, denominators } = loadCorpus()

  return (
    <div className="min-h-screen bg-kaghaz text-dawat">
      <SiteNav ground="paper" current="Comparison" />
      <main id="main" className="mx-auto max-w-[1180px] px-5 pb-24 pt-10 sm:px-8">
        <h1 className="text-[32px] leading-tight text-kashi">Comparison</h1>
        <p className="mt-3 max-w-measure text-body">
          This is not the front door and it is not the site&rsquo;s opinion. The ranking
          below is a function of the sliders on the left, which start even and are yours
          to move. Nothing here is published as a greatest-empire ordering, and the
          weights travel in the address bar so you can send someone a view rather than
          an argument.
        </p>
        <Comparison narrative={narrative} backdrop={backdrop} denominators={denominators} />
      </main>
    </div>
  )
}
