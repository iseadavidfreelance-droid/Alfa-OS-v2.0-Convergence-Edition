
/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#050505',
        matrix: '#00ff41',
        alert: '#ef4444',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderColor: theme => ({
        ...theme('colors'),
        DEFAULT: theme('colors.gray.800', 'currentColor'),
      }),
    },
  },
  plugins: [],
};

// In a real Vite project, this would be `export default tailwindConfig;`
// For the CDN, we attach it to the window.
window.tailwind.config = tailwindConfig;
