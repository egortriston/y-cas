import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Golos Text", "YS Text", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Jura", "Golos Text", "YS Display", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        yandex: {
          yellow: "#FFCC00",
          red: "#FF3B30",
          black: "#111111",
          ink: "#030507",
          felt: "#05090C",
          card: "#F7E6B0",
          ivory: "#F6F0DF",
          copper: "#B76E45",
          cyan: "#65E9FF",
          violet: "#7A5CFF",
        },
      },
      boxShadow: {
        table: "0 46px 140px rgba(0,0,0,.62)",
        card: "0 34px 90px rgba(0,0,0,.42)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.8s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
