/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sun-yellow': '#FACC15',
        'deep-blue': '#1E40AF',
        'off-white': '#F9FAFB', // Cool gray 50 approximation
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
