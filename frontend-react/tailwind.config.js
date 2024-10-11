/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        kodchasan: ['Kodchasan', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      width: {
        '110': '430px',
      },
    },
  },
  plugins: [
    
  ],
};