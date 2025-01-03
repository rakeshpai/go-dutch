/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      primary: 'light-dark(#333, #eee)',
      'primary-inverted': 'light-dark(#eee, #333)',
      secondary: 'light-dark(#060606, #aaa)',
      'page-bg': 'light-dark(#f1f1f1, #060606)',
      'page-bg-inverted': 'light-dark(#060606, #f1f1f1)',
    },
  },
  plugins: [],
};
