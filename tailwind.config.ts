import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
      fontFamily: {
        sans: ['"Zen Maru Gothic"', "ui-rounded", "system-ui", "sans-serif"],
        display: ["Fredoka", "ui-rounded", "system-ui", "sans-serif"],
      },
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
        // Celestial gold (brighter in the mid range so it pops on navy)
        gold: {
          50: "#FCF9EE",
          100: "#F7F1D6",
          200: "#EFE2AD",
          300: "#F9D77A",
          400: "#F6C453",
          500: "#E3B13B",
          600: "#A98326",
          700: "#86641E",
          800: "#694C1D",
          900: "#553D1C",
          DEFAULT: "#E3B13B",
        },
        // New guild accents (use for highlights, gauges, badges)
        aqua: {
          DEFAULT: "#4FE0D0",
          deep: "#1FA99B",
          ink: "#062A2B",
        },
        crimson: {
          DEFAULT: "#FF5C7A",
          deep: "#C22F4C",
        },
        lilac: {
          DEFAULT: "#B69CFF",
          deep: "#7D5FD6",
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
        "gold-glow": "0 0 15px rgba(246, 196, 83, 0.35)",
        "aqua-glow": "0 0 18px rgba(79, 224, 208, 0.35)",
        chunky: "0 6px 0 rgba(0, 0, 0, 0.32)",
        "card-fantasy": "0 6px 0 rgba(0, 0, 0, 0.12), inset 0 0 0 2px rgba(197, 160, 52, 0.15)",
        "card-fantasy-dark": "0 6px 0 rgba(0, 0, 0, 0.32), inset 0 0 0 2px rgba(246, 196, 83, 0.14)",
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.85)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        twinkle: "twinkle 2.4s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;