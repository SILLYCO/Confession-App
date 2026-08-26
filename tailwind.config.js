/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        church: {
          50: '#fbf9f4',
          100: '#f5f0e4',
          200: '#ebdcc5',
          300: '#ddc19b',
          400: '#cca26f',
          500: '#b88647',
          600: '#9e6d38',
          700: '#7e522d',
          800: '#67432a',
          900: '#553826',
          950: '#301d14',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#071626',
        },
        gold: {
          50: '#fdfbf2',
          100: '#faf5df',
          200: '#f4e7b5',
          300: '#edd485',
          400: '#e4bc55',
          500: '#d4af37', // rich church gold
          600: '#b88e28',
          700: '#926a21',
          800: '#785320',
          900: '#64441e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Amiri', 'system-ui', 'sans-serif'],
        serif: ['Cinzel', 'Amiri', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
