/**
 * Year display.
 *
 * The corpus stores years as signed integers, which is right for arithmetic —
 * spans, scales and sorting all depend on it — and wrong for reading. A
 * Sasanian page showing "224" beside an Achaemenid page showing "-550" is not
 * a smaller number, it is a different era, and the minus sign does not say so.
 *
 * There is no year zero: 1 BC is followed by AD 1. The data uses astronomical
 * numbering nowhere, so a stored -550 means 550 BC and needs no offset.
 */

/** "550 BC" / "224". AD is left implicit, BC never is. */
export function formatYear(y: number): string {
  return y < 0 ? `${-y} BC` : String(y)
}

/**
 * A span's endpoints, with the era stated once where both sides share it.
 * "550–330 BC" rather than "550 BC – 330 BC"; "247 BC – AD 224" where the
 * span crosses the era boundary, because there the AD has to be said.
 */
export function formatSpan(from: number, to: number): string {
  if (from < 0 && to < 0) return `${-from}–${-to} BC`
  if (from < 0 && to >= 0) return `${-from} BC – AD ${to}`
  return `${from}–${to}`
}

/** For a range inside one endpoint, e.g. an uncertain start of 999–1005. */
export function formatRange(min: number, max: number): string {
  if (min === max) return formatYear(min)
  if (min < 0 && max < 0) return `${-min}–${-max} BC`
  if (min < 0 && max >= 0) return `${-min} BC – AD ${max}`
  return `${min}–${max}`
}
