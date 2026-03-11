import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#fdf8f0',
          100: '#faf0e0',
          200: '#f5e0c0',
          300: '#edc896',
        },
        blush: {
          100: '#fce8e8',
          200: '#f9d0d0',
          300: '#f4a8a8',
          400: '#e87878',
          500: '#d95555',
        },
        sage: {
          100: '#e8f0e8',
          200: '#c8dcc8',
          300: '#8fb88f',
          400: '#5a9060',
          500: '#3d6b42',
        },
        choco: {
          100: '#d4b896',
          200: '#b8916a',
          300: '#8b6340',
          400: '#6b4423',
          500: '#4a2c10',
        },
        gold: {
          100: '#fef9e7',
          200: '#fdeea0',
          300: '#f8d44a',
          400: '#e8b800',
          500: '#c49800',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'fadeUp': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
