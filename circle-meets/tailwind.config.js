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
    extend: {},
    colors: {
      purple: "#3D405B",
      yellow: "#F2CC8F",
      cyan: "#81B29A",
      red: "#E07A57",
      lightpurple: "#A1A0D6",
    },
  },
  plugins: [],
};
