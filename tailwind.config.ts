import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Tema boutique: azul medianoche + dorado/laton
        midnight: {
          950: "#070b18",
          900: "#0b1120",
          800: "#111a30",
          700: "#1a2540",
          600: "#243352",
          500: "#33446b",
        },
        brass: {
          400: "#e7c987",
          500: "#d4af6a",
          600: "#c19a4f",
          700: "#9a7836",
        },
        ink: {
          DEFAULT: "#e8edf7",
          soft: "#aab4cb",
          dim: "#6f7a93",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
        glow: "0 0 0 1px rgba(212,175,106,0.25), 0 8px 30px -10px rgba(212,175,106,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
