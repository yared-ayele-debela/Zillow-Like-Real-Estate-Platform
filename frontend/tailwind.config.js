/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C5190D",
        secondary: "#D61BA8",
        accent: "#10B981",
        darkBlue: "#0F172A",
      },
    },
  },
  plugins: [],
}