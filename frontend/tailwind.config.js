/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F5F0E8',
        accent: '#FF4B4B',
        accentYellow: '#FFD43B',
        accentPurple: '#9B8FFF',
      },
      boxShadow: {
        'neo': '4px 4px 0px rgba(0, 0, 0, 1)',
      },
      border: {
        'bold': '2px solid black',
      },
    },
  },
  plugins: [],
};
