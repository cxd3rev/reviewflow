/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    "text-ink",
    "text-muted",
    "bg-paper",
    "bg-ink",
    "bg-surface",
    "border-edge",
    "divide-edge",
    "text-brand-500",
    "text-brand-600",
    "text-brand-700",
    "bg-brand-50",
    "bg-brand-50/50",
    "bg-brand-50/80",
    "bg-brand-400",
    "to-brand-50/80",
    "border-brand-100",
    "border-brand-400",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#F5F5F5",
        muted: "#8C8C93",
        paper: "#0A0A0A",
        surface: "#141416",
        edge: "#2A2A2E",
        brand: {
          50: "#1A2744",
          100: "#24345A",
          400: "#6BA0FF",
          500: "#3D7EFF",
          600: "#5B8CFF",
          700: "#8AB4FF",
          800: "#C5D8FF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255, 255, 255, 0.04)",
      },
    },
  },
  plugins: [],
};
