import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand Accent: Amber/Yellow ────────────────────
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f5a623',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // ── Surface / Chrome Scale ────────────────────────
        chrome: {
          50:  '#f0f0f0',
          100: '#e0e0e0',
          200: '#aaaaaa',
          300: '#888888',
          400: '#666666',
          500: '#444444',
          600: '#333333',
          700: '#242424',
          800: '#1a1a1a',
          850: '#181818',
          900: '#111111',
          950: '#080808',
        },
        // ── Risk Tiers ────────────────────────────────────
        risk: {
          low:      '#22c55e',
          medium:   '#f59e0b',
          high:     '#f97316',
          critical: '#ef4444',
        },
        // ── Tailwind semantic tokens (keep for compat) ───
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border:     'var(--border)',
        primary: {
          DEFAULT:    'var(--accent)',
          foreground: '#000000',
        },
        card: {
          DEFAULT:    'var(--surface)',
          foreground: 'var(--foreground)',
        },
        muted: {
          DEFAULT:    'var(--surface-hover)',
          foreground: 'var(--foreground-muted)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-in-r': 'slideInRight 0.2s ease-out',
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'blink':      'blink-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 1px)',
        sm: 'calc(var(--radius) - 2px)',
      },
    },
  },
  plugins: [],
}

export default config
