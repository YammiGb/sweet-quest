/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sweet: {
          green: '#7ACF3B',
          'green-light': '#9EDB6B',
          'green-dark': '#5BA82A',
          'green-mint': '#B8E6A3',
          background: '#FAEBD7',
          'background-light': '#FFFFFF',
          'background-dark': '#F5E6D3',
          accent: '#7ACF3B',
          'accent-light': '#B8E6A3',
          text: '#2D3748',
          'text-light': '#4A5568',
          'text-dark': '#1A202C',
          yellow: '#FFD700',
          'yellow-light': '#FFF8DC'
        }
      },
      fontFamily: {
        'sweet': ['Comic Sans MS', 'Marker Felt', 'Chalkduster', 'Bradley Hand', 'Brush Script MT', 'cursive', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'sweet-serif': ['Georgia', 'Times New Roman', 'serif'],
        'sweet-display': ['Impact', 'Arial Black', 'system-ui', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};