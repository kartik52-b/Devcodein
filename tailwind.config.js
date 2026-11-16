/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Breakpoint tokens — every responsive variant in the app uses these five.
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        // Brand + surface tokens. Existing slate/indigo scales are kept for
        // legacy surfaces; new work should prefer these semantic names.
        canvas: 'var(--dv-canvas)',
        surface: 'var(--dv-surface-solid)',
        brand: {
          DEFAULT: 'var(--dv-primary)',
          soft: 'var(--dv-primary-soft)'
        },
        accent: 'var(--dv-accent)',
        positive: 'var(--dv-success)',
        caution: 'var(--dv-warning)',
        critical: 'var(--dv-danger)',
        // Single extra dark step used by the app shell.
        slate: {
          950: '#050816'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        // Small sentence-case labels and eyebrow text.
        label: '0.08em'
      },
      // Six radius tokens only: sm, md, lg, xl, 2xl, full.
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px'
      },
      boxShadow: {
        card: '0 20px 60px -28px rgba(2, 6, 23, 0.9)',
        glow: '0 0 120px rgba(124, 58, 237, 0.35)',
        focus: '0 0 0 2px rgba(34, 211, 238, 0.7)'
      },
      spacing: {
        section: '2rem',
        'section-lg': '3rem'
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseSlow: 'pulse 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    }
  },
  plugins: []
};
