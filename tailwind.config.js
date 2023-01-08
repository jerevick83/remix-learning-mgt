/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    screens: {
      "sm": "340px",
      // => @media (min-width: 640px) { ... }

      "md": "768px",
      // => @media (min-width: 768px) { ... }

      "lg": "1024px",
      // => @media (min-width: 1024px) { ... }

      "xl": "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px"
      // => @media (min-width: 1536px) { ... }
    },
    extend: {},
    letterSpacing: {widest:'.50em'}
  },
  plugins: []
};