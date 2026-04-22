/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2B48C',
        accent: '#CD5C5C',
        light: '#F5F5DC',
        dark: '#2F4F4F',
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'serif'],
      },
      backgroundImage: {
        'paper-texture': "url('https://www.transparenttextures.com/patterns/rice-paper.png')",
      },
    },
  },
  plugins: [],
}

