/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
