/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // o 'media' si prefieres detectar el modo oscuro automáticamente
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    
    extend: {
      
      boxShadow: {
        highlight:
          "0 4px 6px -1px rgba(255, 252, 242, 0.1), 0 2px 4px -1px rgba(255, 252, 242, 0.06)",
      },
      fontFamily: {
        title: ["Syne", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        light: {
          background: "#FFFCF2",
          secondary: "#CCC5B9",
          text: "#252422",
          buttons: "#EB5E28",
          highlight: "#403D39",
        },
        dark: {
          background: "#252422",
          secondary: "#403D39",
          text: "#CCC5B9",
          buttons: "#EB5E28",
          highlight: "#FFFCF2",
        },
      },
    },
    listStyleType: {
      none: "none",
      disc: "disc",
      decimal: "decimal",
      square: "square",
      roman: "upper-roman",
    },
  },
  plugins: [],
};
