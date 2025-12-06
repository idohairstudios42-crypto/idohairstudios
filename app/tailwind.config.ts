import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        lato: ['var(--font-lato)'],
        playfair: ['var(--font-playfair)'],
        sans: ['Bebas Neue', 'sans-serif'],
      },
      // other extensions
    },
  },
  plugins: [],
}

export default config 