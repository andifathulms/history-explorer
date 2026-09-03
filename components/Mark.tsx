/**
 * The site mark: a rule with one node on it.
 *
 * It is the thread reduced to its smallest legible form — an axis and a
 * position on it — which is the one idea every section of the site shares. It
 * is deliberately not a monogram or a crown: nothing here should suggest the
 * site has a favourite empire.
 */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
      fill="none"
      strokeLinecap="round"
    >
      <path d="M10 1.5v17" className="stroke-firuze" strokeWidth="1.5" />
      <path d="M3.5 6.5h5" className="stroke-current opacity-45" strokeWidth="1.5" />
      <path d="M11.5 14h5" className="stroke-current opacity-45" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" className="fill-firuze" />
    </svg>
  )
}
