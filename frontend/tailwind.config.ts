import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Devanagari", "-apple-system", "sans-serif"],
        heading: ["Space Grotesk", "Poppins", "sans-serif"],
      },
      colors: {
        cyan: {
          400: "#00D9FF",
          500: "#00B8D9",
          600: "#0095B0",
        },
        amber: {
          400: "#FFB800",
          500: "#F59E0B",
        },
        navy: {
          900: "#0A1128",
          800: "#101D3F",
          700: "#1B2845",
          600: "#273B63",
        },
        verdict: {
          supported: "#10B981",
          false: "#EF4444",
          misleading: "#FFB800",
          unverifiable: "#9CA3AF",
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -5px rgba(0, 217, 255, 0.4)',
        'cyan-glow-lg': '0 0 35px 0px rgba(0, 217, 255, 0.6)',
        'card-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
};
export default config;
