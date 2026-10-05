/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#06080B', 2: '#0C0F14', 3: '#131821' },
        fg: { DEFAULT: '#EDEFF2', 2: '#A3ACB9', 3: '#7C8592' },
        line: { DEFAULT: '#EDEFF214', 2: '#EDEFF229' },
        accent: { DEFAULT: '#F2C14E', ink: '#1A1405' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-ui)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
