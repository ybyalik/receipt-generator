module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
  theme: {
    extend: {
      // All colors are defined in styles/globals.css @theme directive
      // Keeping config minimal for Tailwind v4
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
