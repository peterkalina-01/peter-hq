/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        bg: '#08080a',
        'bg-elev': '#101014',
        'bg-card': '#14141a',
        'bg-hover': '#1c1c24',
        border: '#22222c',
        'border-strong': '#2e2e3a',
        text: '#f7f7f5',
        'text-dim': '#8a8a94',
        'text-subtle': '#55555f',
        accent: '#c8ff00',
        'accent-dim': '#94bf00',
        warm: '#ff7849',
        cool: '#6db6ff',
        rose: '#ff5d7a',
        green2: '#4ade80',
        teal: '#2dd4bf',
        violet: '#a78bfa',
      },
    },
  },
  plugins: [],
};
