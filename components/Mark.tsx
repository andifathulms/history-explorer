/**
 * The site mark: three duration spans, each beginning later than the last.
 *
 * This is the brand export's own drawing — "Rentang" at its 32px tier, which
 * the export specifies as three solid staggered spans, stagger only. The
 * geometry is lifted verbatim from `svg/favicon.svg` so the tab, the home
 * screen and the header are the same mark rather than three near-misses.
 *
 * What is not lifted is the ground. The exported icon sits on an ink rounded
 * square because an app icon has to carry its own background; a header mark
 * does not, and this site changes ground under it — dark for navigating, paper
 * for reading. Drawing the square here would put a dark sticker in the corner
 * of every reading page. So the spans stand alone and the page's own ground
 * shows through, which is also what the mark means: the bars are the subject,
 * the field behind them is not.
 *
 * The teal is the site's own `firuze` rather than the export's #3D9585. They
 * differ by a few points of green, both say the same thing — a figure a cited
 * work actually gives — and DESIGN.md is explicit that no new hue enters the
 * palette. The export's own rule about ochre is respected by simply not using
 * it: nothing here is "you are here".
 *
 * It replaced an axis-and-node drawing that predated the brand work.
 */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg
      // Cropped square to the three spans with even padding, so the mark fills
      // the box it is given instead of floating in the icon's own margins.
      viewBox="10 13 76 76"
      aria-hidden="true"
      className={className}
    >
      <rect x="12" y="22" width="46" height="15" className="fill-firuze" />
      <rect x="26" y="43" width="48" height="15" className="fill-firuze" />
      <rect x="38" y="64" width="44" height="15" className="fill-firuze" />
    </svg>
  )
}
