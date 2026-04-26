import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        surface: "#1A1C21",
        primary: "#EAEAF0",
        secondary: "#A0A3AA",
        accent: "#7AA7F9",
      },
      boxShadow: {
        soft: "0 30px 80px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        "slow-pulse": "slow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": { opacity: "0.75" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
