/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Force light mode by default (requires 'dark' class on html to activate)
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A237E',
          50: '#EEF0FA',
          100: '#D9DCF4',
          200: '#B1B7E7',
          300: '#8A93DB',
          400: '#626ECF',
          500: '#3B49C2',
          600: '#2F3A9B',
          700: '#232C75',
          800: '#171D4E',
          900: '#0B0F27',
        },
        accent: {
          DEFAULT: '#FF6D00',
          50: '#FFF3E6',
          100: '#FFE3C2',
          200: '#FFC184',
          300: '#FFA146',
          400: '#FF8514',
          500: '#FF6D00',
          600: '#D95D00',
          700: '#B34C00',
          800: '#8C3B00',
          900: '#662900',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0,0,0,0.06)',
        card: '0 12px 32px rgba(26,35,126,0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

