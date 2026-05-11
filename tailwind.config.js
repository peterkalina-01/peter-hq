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
        bg: '#09090c',
        'bg-elev': '#111116',
        'bg-card': '#15151c',
        'bg-hover': '#1e1e28',
        border: '#242430',
        'border-strong': '#32323f',
        text: '#f5f5f2',
        'text-dim': '#888894',
        'text-subtle': '#52525e',
        // Primary accent — orange
        accent: '#ff7849',
        'accent-dim': '#cc5f3a',
        // Secondary — lime
        lime: '#c8ff00',
        'lime-dim': '#94bf00',
        // Others
        cool: '#6db6ff',
        rose: '#ff5d7a',
        green2: '#4ade80',
        teal: '#2dd4bf',
        violet: '#a78bfa',
        warm: '#ff7849',
      },
    },
  },
  plugins: [],
};
