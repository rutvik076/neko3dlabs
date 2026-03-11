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
        graphite: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#1e1e1e',
          600: '#2a2a2a',
          500: '#3a3a3a',
          400: '#555555',
          300: '#888888',
          200: '#b0b0b0',
          100: '#d4d4d4',
          50:  '#f0f0f0',
        },
        steel: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
        tech: {
          blue:   '#2563eb',
          orange: '#ff6a00',
          green:  '#00c896',
          dark:   '#1e1e1e',
        },
        // Keep old names as aliases to avoid build errors in pages
        cream: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
        },
        blush: {
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#3b82f6',
          500: '#2563eb',
        },
        sage: {
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#10b981',
          500: '#059669',
        },
        choco: {
          100: '#cbd5e1',
          200: '#94a3b8',
          300: '#64748b',
          400: '#475569',
          500: '#1e293b',
        },
        gold: {
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fb923c',
          400: '#f97316',
          500: '#ea580c',
        },
      },
      fontFamily: {
        display: ['Outfit', 'var(--font-display)', 'sans-serif'],
        body: ['Space Grotesk', 'var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fadeUp': 'fadeUp 0.45s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.6' },
        },
      },
      boxShadow: {
        'blue-glow': '0 4px 20px rgba(37,99,235,0.25)',
        'orange-glow': '0 4px 20px rgba(255,106,0,0.25)',
        'card': '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
export default config
