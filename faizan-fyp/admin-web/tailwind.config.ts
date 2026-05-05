import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8E7',
        surface: '#FDF6E3',
        brand: {
          DEFAULT: '#5B8DEF',
          dark: '#3A6BC4',
          light: '#A9C6F5',
        },
        accent: '#FFB74D',
        sageDark: '#4CAF9E',
        softError: '#E57373',
        softSuccess: '#81C784',
        ink: '#3D3D3D',
      },
      fontFamily: {
        body: ['Lexend', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};

export default config;
