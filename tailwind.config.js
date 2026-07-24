/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#050816'
        }
      },
      boxShadow: {
        glow: '0 0 120px rgba(124, 58, 237, 0.35)'
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
