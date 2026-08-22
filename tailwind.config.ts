import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        karobaari: {
          maroon: "#8B1E2D",
          darkMaroon: "#5C0F1A",
          gold: "#D4AF37",
          darkGray: "#2B2D31",
          mediumGray: "#494C52",
          lightGray: "#E5E7EB",
          offWhite: "#F7F8FA",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Poppins'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.06)",
        cardHover: "0 8px 24px rgba(139, 30, 45, 0.12)",
        daraz: "0 2px 4px 0 rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};
export default config;