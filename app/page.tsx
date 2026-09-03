import { loadCorpus } from '@/lib/content'

export default function Home() {
  const c = loadCorpus()
  return (
    <main id="main" className="min-h-screen bg-dawat p-8 text-kaghaz">
      <h1 className="text-chapter">Sambung</h1>
      <p>
        {c.narrative.length} narrative, {c.context.length} context,{' '}
        {c.backdrop.length} backdrop, {c.edges.length} edges,{' '}
        {[...c.chapters.values()].flat().length} chapters
      </p>
    </main>
  )
}
