module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0A0A0A',
          900: '#0F0F0F',
          800: '#161616',
          700: '#1A1A1A',
          600: '#222222',
          500: '#2D2D2D',
          400: '#3A3A3A',
          300: '#4A4A4A',
        },
        warm: {
          50: '#F5F0EB',
          100: '#EDE6DF',
          200: '#D4CCC4',
          300: '#B8B0A8',
          400: '#9A928A',
          500: '#7A736C',
          600: '#5C5650',
        },
        accent: {
          DEFAULT: '#F2C94C',
          light: '#FFD95A',
          dark: '#D4AD2E',
          muted: 'rgba(242,201,76,0.12)',
          soft: 'rgba(242,201,76,0.08)',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
