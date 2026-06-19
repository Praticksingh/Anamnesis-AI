import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-midnight": "var(--c-midnight)",
        "brand-space": "var(--c-space)",
        "brand-azure": "var(--c-azure)",
        "brand-cyan": "var(--c-cyan)",
        "brand-gold": "var(--c-gold)",
        "brand-emerald": "var(--c-emerald)",
        "brand-violet": "var(--c-violet)",
        "brand-slate100": "var(--c-slate-100)",
        "brand-slate200": "var(--c-slate-200)",
        "brand-slate300": "var(--c-slate-300)",
        "brand-slate500": "var(--c-slate-500)"
      }
    }
  }
};

export default config;


