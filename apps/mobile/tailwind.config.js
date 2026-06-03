const { yeonTailwindPreset } = require("@yeon/design-tokens/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset"), yeonTailwindPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
