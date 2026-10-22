import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        "border-hover": "hsl(var(--border-hover) / <alpha-value>)",
        separator: "hsl(var(--separator) / <alpha-value>)",
        surface: {
          section: "hsl(var(--surface-section) / <alpha-value>)",
          inner: "hsl(var(--surface-inner) / <alpha-value>)",
          tertiary: "hsl(var(--surface-tertiary) / <alpha-value>)",
          hover: "hsl(var(--surface-hover) / <alpha-value>)",
        },
        tag: "hsl(var(--tag-bg) / <alpha-value>)",
        "accent-soft": {
          DEFAULT: "hsl(var(--accent-soft) / <alpha-value>)",
          foreground: "hsl(var(--accent-soft-foreground) / <alpha-value>)",
        },
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "calc(var(--radius) - 2px)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        card: "var(--radius-card)",
        inner: "var(--radius-inner)",
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        pop: "var(--shadow-pop)",
        primary: "var(--shadow-primary)",
        outline: "var(--shadow-outline)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(180deg, hsl(var(--primary-gradient-from)), hsl(var(--primary-gradient-to)))",
        "primary-gradient-hover":
          "linear-gradient(180deg, hsl(var(--primary-gradient-hover-from)), hsl(var(--primary-gradient-hover-to)))",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        "card-inset": "var(--card-inset)",
      },
      translate: {
        lift: "var(--lift)",
      },
      scale: {
        press: "var(--press-scale)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
      },
      aspectRatio: {
        thumb: "var(--thumb-aspect)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
