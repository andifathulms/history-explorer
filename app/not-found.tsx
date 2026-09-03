import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="ground-dark min-h-screen">
      <main id="main" className="mx-auto max-w-measure px-5 py-24 sm:px-8">
        <h1 className="text-[32px] text-kaghaz">Nothing here</h1>
        <p className="mt-4 text-debu-paper">
          This site covers eight polities between 819 and 1231. Coverage follows one
          person&rsquo;s curiosity and makes no claim to completeness, so a missing page is
          usually a page that was never written rather than one that moved.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-firuze underline underline-offset-4">
            Back to the thread
          </Link>
        </p>
      </main>
    </div>
  )
}
