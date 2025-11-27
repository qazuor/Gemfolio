/** @type {import('./tokens').DesignTokens} */
export const tokens = {
  colors: {
    // Brand colors - Golden elegant theme for jewelry
    primary: {
      50: '#FDF8E7',
      100: '#FAF0CF',
      200: '#F5E1A0',
      300: '#EFD170',
      400: '#E9C141',
      500: '#D4AF37', // Main gold
      600: '#B8960B',
      700: '#8A7008',
      800: '#5C4B06',
      900: '#2E2503',
      950: '#171301',
    },
    // Stone/neutral colors
    stone: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
      950: '#0C0A09',
    },
  },
  fontFamily: {
    heading: ['Playfair Display', 'Georgia', 'serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    DEFAULT: '0.5rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
    // Custom golden glow for hover effects
    'gold-sm': '0 0 10px rgb(212 175 55 / 0.2)',
    'gold-md': '0 0 20px rgb(212 175 55 / 0.3)',
    'gold-lg': '0 0 30px rgb(212 175 55 / 0.4)',
  },
  animation: {
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'fade-out': 'fadeOut 0.3s ease-in-out',
    'slide-in-up': 'slideInUp 0.3s ease-out',
    'slide-in-down': 'slideInDown 0.3s ease-out',
    'slide-in-left': 'slideInLeft 0.3s ease-out',
    'slide-in-right': 'slideInRight 0.3s ease-out',
    'scale-in': 'scaleIn 0.2s ease-out',
    shimmer: 'shimmer 2s infinite linear',
    'pulse-gold': 'pulseGold 2s infinite',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideInUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInDown: {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-10px)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    slideInRight: {
      '0%': { transform: 'translateX(10px)', opacity: '0' },
      '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    pulseGold: {
      '0%, 100%': { boxShadow: '0 0 0 0 rgb(212 175 55 / 0.4)' },
      '50%': { boxShadow: '0 0 0 8px rgb(212 175 55 / 0)' },
    },
  },
};

export default tokens;
