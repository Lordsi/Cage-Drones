import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        "aero-cyan": "var(--accent)",
        "nav-dark": "var(--nav-dark)",
        "card-bg": "var(--card)",
        "surface-bg": "var(--surface)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "8px",
        btn: "4px",
      },
    },
  },
  plugins: [],
} satisfies Config;
