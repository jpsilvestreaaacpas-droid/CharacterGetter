import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Fantasy / Celestial & Elemental Palette
        gold: {
          50: "#FCF9EE",
          100: "#F7F1D6",
          200: "#EFE2AD",
          300: "#E4CF80",
          400: "#D7B954",
          500: "#C5A034", // Muted Celestial Gold
          600: "#A98326",
          700: "#86641E",
          800: "#694C1D",
          900: "#553D1C",
          DEFAULT: "#C5A034",
        },
        element: {
          pyro: "#FF6640",
          hydro: "#3898EC",
          anemo: "#48C9B0",
          electro: "#A056E8",
          dendro: "#7BC62D",
          cryo: "#77C2D8",
          geo: "#DEAC35",
        },
        rarity: {
          5: "#E8A338", // 5-Star Gold
          4: "#9B64D8", // 4-Star Purple
          3: "#4D8EEB", // 3-Star Blue
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "gold-sm": "0 1px 3px 0 rgba(197, 160, 52, 0.15), 0 1px 2px -1px rgba(197, 160, 52, 0.1)",
        "gold-md": "0 4px 6px -1px rgba(197, 160, 52, 0.2), 0 2px 4px -2px rgba(197, 160, 52, 0.15)",
        "gold-glow": "0 0 15px rgba(215, 185, 84, 0.35)",
        "card-fantasy": "0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(197, 160, 52, 0.15)",
        "card-fantasy-dark": "0 4px 25px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(215, 185, 84, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
