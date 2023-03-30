/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'dm': ["DM Serif Display"]
      },
      boxShadow: {
        'button': '2px 2px 0 0 #000'
      },
      padding: {
        '1': '.5vw',
        '2': '1vw',
        '3': '2vw',
        '4': 'vw',
        '5': '5vw',
        '6': '6vw',
        '7': '7vw',
      }
    },
    colors: {
      communixGreen: '#81B29A',
      communixYellow: '#F2CC8F',
      communixRed: '#E07A5F',
      communixWhite: '#F4F1DE',
      communixPurple: '#3D405B'
    }
  },
  plugins: [],
};
