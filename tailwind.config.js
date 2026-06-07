/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          950: '#05080f',
          900: '#0b1120',
          800: '#111827',
          700: '#1a2540',
          600: '#22304f',
        },
        odds: {
          DEFAULT: '#00e676',
          dim:     '#00b85e',
          muted:   '#004d25',
        },
        luck: {
          red:       '#c0392b',
          redLight:  '#e74c3c',
          gold:      '#d4af37',
          goldLight: '#f0c040',
          goldMuted: '#7a5c00',
        },
        taiwan: {
          red:   '#fe0000',
          blue:  '#000095',
          white: '#ffffff',
        },
        text: {
          primary:   '#f0f4ff',
          secondary: '#9ba8c4',
          muted:     '#4a5568',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'felt-gradient':   'radial-gradient(ellipse at 50% 0%, #1a2540 0%, #0b1120 60%, #05080f 100%)',
        'gold-shimmer':    'linear-gradient(105deg, #7a5c00 0%, #d4af37 40%, #f0c040 50%, #d4af37 60%, #7a5c00 100%)',
        'card-shine':      'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 50%, rgba(212,175,55,0.04) 100%)',
        'section-divider': 'linear-gradient(90deg, transparent, #d4af37, transparent)',
      },
      boxShadow: {
        'neon-green': '0 0 8px #00e676, 0 0 24px rgba(0,230,118,0.3)',
        'neon-gold':  '0 0 8px #d4af37, 0 0 24px rgba(212,175,55,0.35)',
        'neon-red':   '0 0 8px #c0392b, 0 0 20px rgba(192,57,43,0.4)',
        'card-lift':  '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(212,175,55,0.12)',
        'inner-gold': 'inset 0 1px 0 rgba(212,175,55,0.2)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        chipSpin: {
          '0%':   { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        neonPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%':      { opacity: '0.85', filter: 'brightness(1.3)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        tileFlip: {
          '0%':   { transform: 'rotateX(90deg)', opacity: '0' },
          '100%': { transform: 'rotateX(0deg)',  opacity: '1' },
        },
        breatheGold: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(212,175,55,0.2)' },
          '50%':      { boxShadow: '0 0 32px rgba(212,175,55,0.5)' },
        },
      },
      animation: {
        shimmer:     'shimmer 3s linear infinite',
        chipSpin:    'chipSpin 1.2s ease-in-out',
        neonPulse:   'neonPulse 2s ease-in-out infinite',
        slideUp:     'slideUp 0.5s ease-out forwards',
        tileFlip:    'tileFlip 0.4s ease-out forwards',
        breatheGold: 'breatheGold 3s ease-in-out infinite',
      },
      borderRadius: {
        card: '10px',
        chip: '50%',
      },
      spacing: {
        section: '5rem',
      },
    },
  },
  plugins: [],
}
