/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    backgroundImage: {
      'custom-gradient': 'radial-gradient(circle, #1f3756, #141539)',
    },
  },
};
export const plugins = [
];