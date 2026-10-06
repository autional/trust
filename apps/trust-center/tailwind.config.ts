import type { Config } from 'tailwindcss';
import preset from '@autional/tailwind-preset';

const config: Config = {
  darkMode: 'class',
  presets: [preset],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@autional/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
