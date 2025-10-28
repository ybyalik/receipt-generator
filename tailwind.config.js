module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern, sophisticated color palette
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        accent: {
          50: '#e6f6ff',
          100: '#b3e0ff',
          200: '#80c9ff',
          300: '#4db3ff',
          400: '#1a9cff',
          500: '#0070c9', // Primary accent - darkened for WCAG compliance (4.7:1 contrast with white)
          600: '#005fa3',
          700: '#004d85',
          800: '#003a66',
          900: '#002747',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'lg': '0 8px 24px 0 rgba(0, 0, 0, 0.10)',
        'xl': '0 16px 48px 0 rgba(0, 0, 0, 0.12)',
        '2xl': '0 24px 64px 0 rgba(0, 0, 0, 0.14)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
