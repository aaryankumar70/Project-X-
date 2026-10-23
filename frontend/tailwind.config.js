/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7FC',
        ink: { DEFAULT: '#262B52', soft: '#5B6190', faint: '#8D92B8' },
        line: '#DDE3F3',
        sky: { DEFAULT: '#8EC5FF', deep: '#3F86E0', tint: '#E4F1FF' },
        butter: { DEFAULT: '#FFD978', deep: '#C98F0A', tint: '#FFF4D3' },
        blush: { DEFAULT: '#FFB8C6', deep: '#D9506E', tint: '#FFE6EB' },
        mint: { DEFAULT: '#9FE3C4', deep: '#2E9E75', tint: '#DDF6EA' },
        lilac: { DEFAULT: '#CDBDFF', deep: '#7A5FD6', tint: '#EDE7FF' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Figtree Variable"', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 0 rgba(38,43,82,.04), 0 10px 28px -14px rgba(38,43,82,.22)',
        pop: '0 4px 0 0 rgba(38,43,82,.85)',
      },
    },
  },
  plugins: [],
};
