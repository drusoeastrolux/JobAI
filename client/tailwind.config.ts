import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Newsreader", "Georgia", "serif"],
        headline: ["Newsreader", "Georgia", "serif"],
        body: ["Manrope", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#775a19",
          dim: "#6a4e0d",
          container: "#ffdea5",
        },
        "on-primary": "#fff6ed",
        "primary-container": "#ffdea5",
        surface: {
          DEFAULT: "#faf9f8",
          dim: "#d6dbda",
        },
        "on-surface": {
          DEFAULT: "#2f3333",
          variant: "#5b605f",
        },
        "surface-container": {
          DEFAULT: "#edeeed",
          low: "#f3f4f3",
          high: "#e6e9e8",
          lowest: "#ffffff",
          highest: "#dfe3e2",
        },
        "outline-variant": "#aeb3b2",
        outline: { DEFAULT: "#777c7b" },
      },
    },
  },
  plugins: [],
};

export default config;
