import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090C",
          900: "#0F1115",
          800: "#181B22",
          700: "#242837",
          200: "#D7DBE7",
          100: "#EEF0F6"
        },
        sky: {
          50: "#F2FAFF",
          100: "#E2F4FF",
          200: "#BDE7FF",
          600: "#1E7DBA",
          800: "#0F4F79"
        },
        sage: {
          50: "#F3F7F4",
          100: "#E3EDE6",
          200: "#C1D8C8",
          700: "#2F5B44"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;

