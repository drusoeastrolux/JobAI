import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        headline: ["Playfair Display", "serif"],
        serif:    ["Playfair Display", "serif"],
        sans:     ["Outfit", "sans-serif"],
        body:     ["Outfit", "sans-serif"],
        label:    ["Outfit", "sans-serif"],
        mono:     ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // ── Brand palette ─────────────────────────────────────────────────────
        cream:   "#F5F2EC",
        ink:     "#1A1714",
        sienna:  "#BF4E30",
        "sienna-dark": "#A33E22",
        muted:   "#6B6560",
        border:  "#E8E4DF",
        "border-strong": "#C8C4BF",

        // ── Surface tokens (used by chat component) ───────────────────────────
        surface:                   "#F5F2EC",
        "surface-container":       "#EDEAE4",
        "surface-container-low":   "#F0EDE7",
        "surface-container-high":  "#E6E2DC",
        "surface-container-highest":"#DDD9D3",
        "surface-container-lowest":"#FFFFFF",

        // ── Semantic tokens ───────────────────────────────────────────────────
        "on-surface":         "#1A1714",
        "on-surface-variant": "#6B6560",
        "outline":            "#9E9892",
        "outline-variant":    "#D4CFCA",

        // ── Accent (maps from old "primary" usages still in chat component) ───
        primary:           "#BF4E30",
        "primary-container":"#F0E8E3",
        "on-primary":      "#FFFFFF",

        // ── Secondary (used by chat component) ────────────────────────────────
        secondary:    "#8B6914",
        "on-secondary":"#FFFFFF",
      },
    },
  },
  plugins: [],
};

export default config;
