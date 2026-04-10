import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        headline: ["Newsreader", "Georgia", "serif"],
        body: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
        mono: ["Space Grotesk", "monospace"],
      },
      colors: {
        primary: "#001cbf",
        secondary: "#ba002c",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#444557",
        surface: "#f9f9f9",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f3f3f4",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        outline: "#757689",
        "outline-variant": "#c5c5da",
        "on-primary": "#ffffff",
        "primary-container": "#dfe0ff",
      },
      borderRadius: {
        DEFAULT: "24px",
        sm: "16px",
        md: "24px",
        lg: "32px",
        xl: "48px",
        "2xl": "64px",
        "3xl": "80px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
