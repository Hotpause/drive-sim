/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{ejs}", // Scans all .ejs files in the views folder and its subdirectories
    "./public/**/*.{html,js}", // Scans .html and .js files in the public folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
