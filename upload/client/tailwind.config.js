/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  safelist: [
    "text-ink",
    "text-muted",
    "bg-paper",
    "bg-ink",
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
        ink: "#020817",
        muted: "#65758B",
        paper: "#F8FAFC",
        edge: "#E1E7EF",
        brand: {
          50: "#E8F0FF",
          100: "#D4E3FF",
          400: "#4D8CFF",
          500: "#0057FA",
          600: "#0046D6",
          700: "#003BB3",
          800: "#002F8F",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(2, 8, 23, 0.04)",
      },
    },
  },
  plugins: [],
};
