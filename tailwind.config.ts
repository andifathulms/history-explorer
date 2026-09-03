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
