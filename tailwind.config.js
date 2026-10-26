/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bbt: {
          black: '#07080A',
          surface: '#0F1115',
          card: '#14171D',
          cardHover: '#1B1F27',
          red: '#9E141B',
          crimson: '#C91D26',
          darkred: '#680B10',
          beige: '#C8A273',
          beigeLight: '#E2C59F',
          grey: '#878C8F',
          border: '#232730',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Teko', 'Impact', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
