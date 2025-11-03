import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sevy-blue': '#a2d2ff',
        'sevy-blue-dark': '#6b9dcc',
        'sevy-pink': '#ffc8dd',
        'sevy-pink-dark': '#c58c9f',
        'sevy-pink-light': '#FFF0F5',
        'sevy-bg': '#fff7fb',
        'sevy-text': '#1f2937',
        'sevy-text-secondary': '#4b5563',
      },
      fontFamily: {
        sans: ['ibrand', 'Poppins', 'sans-serif'],
      },
      keyframes: {
        'pulse-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'heartbeat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-once': 'pulse-once 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'heartbeat': 'heartbeat 2.5s ease-in-out infinite',
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config
