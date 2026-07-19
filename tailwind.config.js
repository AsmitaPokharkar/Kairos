/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d8d8dd',
          300: '#b6b6bf',
          400: '#8d8d99',
          500: '#6e6e7a',
          600: '#56565f',
          700: '#45454c',
          800: '#2a2a30',
          900: '#1a1a1f',
          950: '#0f0f13',
        },
        gold: {
          50: '#fbf7ee',
          100: '#f5ecd2',
          200: '#ebd7a3',
          300: '#e0bf6e',
          400: '#d4a845',
          500: '#c08f2a',
          600: '#a3721f',
          700: '#7f551b',
          800: '#5d3f18',
          900: '#3d2a13',
        },
        sage: {
          50: '#f1f6f4',
          100: '#dfebe6',
          200: '#c0dcd4',
          300: '#94c4b7',
          400: '#67a89a',
          500: '#478c7e',
          600: '#367064',
          700: '#2c5a51',
          800: '#264841',
          900: '#213a35',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(212,168,69,0.25), 0 8px 30px -8px rgba(212,168,69,0.18)',
        soft: '0 1px 2px rgba(15,15,19,0.06), 0 8px 24px -12px rgba(15,15,19,0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
