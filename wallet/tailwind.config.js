/** @type {import('tailwindcss').Config} */
export default {
  // Toggle dark mode by adding/removing the `dark` class on <html>.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{html,jsx,tsx,vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — Emerald is primary, Blue is the accent.
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        accent: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        // Neutral surfaces. `ink` = dark theme backgrounds.
        ink: {
          900: "#0b0f14",
          850: "#0f141b",
          800: "#141a22",
          750: "#1a212b",
          700: "#222b37",
          600: "#2c3744",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgb(16 24 40 / 0.08), 0 4px 24px -4px rgb(16 24 40 / 0.06)",
        card: "0 4px 24px -6px rgb(16 24 40 / 0.10)",
        glow: "0 12px 32px -8px rgb(16 185 129 / 0.45)",
        "glow-blue": "0 12px 32px -8px rgb(37 99 235 / 0.40)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-up-fade": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "count-pop": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-up": "slide-up 0.32s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up-fade": "slide-up-fade 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
        "count-pop": "count-pop 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
