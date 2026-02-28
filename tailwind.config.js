/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f7f9',
          100: '#b3e6ed',
          200: '#80d5e1',
          300: '#4dc4d5',
          400: '#1ab3c9',
          500: '#0099b3',
          600: '#007a8f',
          700: '#005b6b',
          800: '#003c47',
          900: '#001d23',
        },
        sand: {
          50: '#fdf8f3',
          100: '#f5ebe0',
          200: '#ebd6c4',
          300: '#e0c1a8',
          400: '#d4ac8c',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
