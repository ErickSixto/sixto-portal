module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#2D2D2D',
        oat: '#F5F0EB',
        accent: '#F2C94C',
        'accent-hover': '#E0B83B',
        body: '#4F4F4F',
        secondary: '#828282',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
}
