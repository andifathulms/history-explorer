import type { Config } from 'tailwindcss'

/**
 * Palette and scale come from DESIGN.md. Token names are the Persian/Malay
 * names used there, not semantic aliases, so that a rule like "zarrin appears
 * at most once per screen" stays greppable.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        dawat: '#0E1A24',
        kaghaz: '#E7E9E3',
        kashi: '#1B4A6B',
        firuze: '#3E9C9C',
        zarrin: '#C08A2E',
        debu: '#7C8079',

        /**
         * Reading variants of the palette above, for small text and for
         * interactive colour on paper ground.
         *
         * DESIGN.md's tokens are the design and they are kept exactly. But debu
         * on kaghaz measures 3.29:1 and firuze on kaghaz 2.66:1, both of which
         * fail WCAG AA for body-sized text, and the quality floor asks for
         * long-form text that is actually readable. These are the same hues
         * blended toward black or white only as far as 4.5:1 requires, so the
         * dust still reads as dust and the turquoise still reads as turquoise.
         *
         * Use these for text. Use the tokens above for the thread, the rails,
         * the bars and everything else graphical.
         */
        'debu-ink': '#666A64', // 4.50:1 on kaghaz
        'debu-paper': '#7F837C', // 4.56:1 on dawat
        'firuze-ink': '#2E7373', // 4.50:1 on kaghaz
        'zarrin-ink': '#876120', // 4.56:1 on kaghaz
      },
      fontFamily: {
        latin: ['var(--font-spectral)', 'Georgia', 'serif'],
        arabic: ['var(--font-amiri)', 'serif'],
      },
      fontSize: {
        body: ['18px', { lineHeight: '1.65' }],
        chapter: ['28px', { lineHeight: '1.25', fontWeight: '600' }],
      },
      maxWidth: {
        measure: '68ch',
      },
      transitionTimingFunction: {
        thread: 'cubic-bezier(0.33, 0.1, 0.15, 1)',
      },
    },
  },
  plugins: [],
}

export default config
