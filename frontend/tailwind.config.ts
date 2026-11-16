import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7',
          hover: '#0369a1',
          light: '#e0f2fe',
          dark: '#075985',
        },
        secondary: {
          DEFAULT: '#0d9488',
          hover: '#0f766e',
          light: '#ccfbf1',
        },
      },
      borderRadius: {
        lg: '16px',
        md: '10px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
