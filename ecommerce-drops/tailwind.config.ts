import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0B',
        paper: '#F4F2EE',
        bone: '#E7E3DC',
        muted: '#6B6862',
        accent: '#D7FF3A',
        alert: '#E5484D',
        ok: '#1F9D55',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', '"Helvetica Neue"', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'sheet-up': 'sheet-up 260ms cubic-bezier(.2,.8,.2,1)',
        'fade-in': 'fade-in 200ms ease-out',
        'toast-in': 'toast-in 220ms ease-out',
      },
    },
  },
  plugins: [],
}

export default config
