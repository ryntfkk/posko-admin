/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff2f2fff", // Warna utama (Dark Blue)
        secondary: "#ffffffff", // Warna sekunder (Slate)
        accent: "#f63b3bff",    // Warna aksen (Blue)
      }
    },
  },
  plugins: [],
}