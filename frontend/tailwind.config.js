/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#542C83', // Primary deep purple
          700: '#482470',
          800: '#3E1F61',
          900: '#2A1443',
        },
        surface: {
          bg: '#F7F7FB',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          navy: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(84, 44, 131, 0.08), 0 8px 10px -6px rgba(84, 44, 131, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
