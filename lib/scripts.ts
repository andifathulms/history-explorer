/**
 * What language a script field is actually in.
 *
 * `polity.yaml` carries `script_lang` for the polity's own name and nothing
 * for a capital's or a ruler's, so both were rendered with a hardcoded
 * `lang="fa"`. Across the corpus that put 426 strings in eleven scripts into
 * Persian: Πέλλα, 長安, Բագրատունյաց Հայաստան, ქართლის სამეფო, 𒀀𒂵𒉈𒆠 and
 * Principatus Antiochenus among them. The stylesheet keys the Arabic face and
 * `direction: rtl` off `[lang='fa']`, so every one of those was set
 * right-to-left in a font with no glyphs for it, and announced to a screen
 * reader as Persian.
 *
 * Rather than migrate 426 entries, the language is read off the characters.
 * That is reliable in the direction that matters: what the stylesheet needs to
 * know is whether a string is in the Arabic script, which is a fact about its
 * code points. A Persian string and an Arabic one are indistinguishable this
 * way, which is why the polity's own declared `script_lang` is preferred where
 * there is one — this only supplies the fallback.
 *
 * Everything not in a right-to-left script gets no `lang` at all. A wrong tag
 * is worse than none: it changes the face, the direction and what a screen
 * reader tries to pronounce.
 */

/** Arabic, plus the presentation forms, and the other RTL scripts in the corpus. */
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const HEBREW = /[֐-׿]/
const SYRIAC = /[܀-ݏ]/
const THAANA = /[ހ-޿]/

/**
 * The `lang` to put on a run of script, or `undefined` for none.
 *
 * `declared` is the polity's own `script_lang`, used when the text is in the
 * Arabic script and the polity has said which language that is — so a Samanid
 * capital comes out `fa` and an Abbasid one `ar`, rather than both guessing.
 */
export function scriptLang(text: string, declared?: string | null): string | undefined {
  if (ARABIC.test(text)) {
    // Only an Arabic-script declaration may claim an Arabic-script string. A
    // polity whose name is Greek and whose capital is Arabic must not label
    // the capital `el`.
    if (declared && ARABIC_LANGS.has(declared)) return declared
    return 'ar'
  }
  if (HEBREW.test(text)) return 'he'
  if (SYRIAC.test(text)) return 'syr'
  if (THAANA.test(text)) return 'dv'
  return undefined
}

const ARABIC_LANGS = new Set(['ar', 'fa', 'ur', 'ps', 'ckb', 'ota', 'az-Arab', 'pnb'])
