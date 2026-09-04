import type { Source } from '@/lib/types'

/**
 * One reference, rendered one way.
 *
 * The Sources page was printing a citation in four places and the About page in
 * a fifth, and only About had ever been taught about `container`. So every
 * Encyclopaedia Iranica entry appeared on the Sources page as a bare headword —
 * "GHAZNAVIDS", "SAMANIDS", "TAHERIDS" — which reads as a shouted book title
 * rather than an entry inside a work. The capitals are Iranica's own house style
 * for headwords and are correct in the data; what was missing was the work they
 * sit in.
 *
 * Fixing the four call sites separately would have left the next field to be
 * added in the same position, so there is now one component and the pages have
 * no citation markup of their own.
 */
export function Cite({
  source,
  showUrl = false,
}: {
  source: Source
  /** The full bibliography links out; the summary lists do not need to. */
  showUrl?: boolean
}) {
  const s = source
  return (
    <>
      {s.author ? <span>{s.author}, </span> : null}
      <cite className="italic">{s.title}</cite>
      {s.container ? <span>, in {s.container}</span> : null}
      {s.edition ? <span>, {s.edition} edn</span> : null}
      {s.publisher ? <span> ({s.publisher}</span> : null}
      {s.publisher && s.year ? (
        <span>, {s.year})</span>
      ) : s.publisher ? (
        <span>)</span>
      ) : s.year ? (
        <span className="text-debu-ink"> ({s.year})</span>
      ) : null}
      {showUrl && s.url ? (
        <>
          {' '}
          <a
            href={s.url}
            rel="noreferrer"
            className="text-kashi underline decoration-kashi/35 underline-offset-4 transition-colors hover:text-firuze-ink hover:decoration-firuze-ink"
          >
            link
          </a>
        </>
      ) : null}
    </>
  )
}
