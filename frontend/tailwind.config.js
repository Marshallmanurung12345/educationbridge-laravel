/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2130",
          light: "#3A4256",
        },
        navy: {
          DEFAULT: "#16233B",
          light: "#223256",
          soft: "#2C3D63",
        },
        paper: "#F3F1EB",
        marigold: "#E3A23C",
        clay: "#B54834",
        sage: "#4F7A5B",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ['"IBM Plex Sans"', "sans-serif"],
      },
      boxShadow: {
        card: "4px 4px 0 0 #16233B",
      },
    },
  },
  plugins: [],
};
