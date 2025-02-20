/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  prefix: "",
  theme: {
    fontFamily: {
      sans: ["Atkinson Hyperlegible", "sans-serif"],
      serif: ["Atkinson Hyperlegible", "serif"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
