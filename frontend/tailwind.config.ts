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
        sans: ["Inter", "Noto Sans Devanagari", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Space Grotesk", "Poppins", "sans-serif"],
      },
      colors: {
        theme: {
          bgStart: "#5B6F9E",
          bgEnd: "#3F5079",
          card: "#F7F9FC",
          cardBorder: "#E2E8F0",
          textPrimary: "#1C2740",
          textSecondary: "#475569",
          textMuted: "#64748B",
        },
        primary: {
          DEFAULT: "#22B8CF",
          hover: "#1A9DB3",
          light: "#E3FAFC",
          dark: "#158091",
        },
        verdict: {
          supported: "#16A34A",
          false: "#DC2626",
          misleading: "#F59E0B",
          unverifiable: "#64748B",
        }
      },
      boxShadow: {
        'card-clean': '0 10px 25px -5px rgba(28, 39, 64, 0.15), 0 8px 10px -6px rgba(28, 39, 64, 0.1)',
        'card-hover': '0 20px 35px -10px rgba(28, 39, 64, 0.22), 0 10px 15px -5px rgba(28, 39, 64, 0.12)',
        'btn-glow': '0 4px 14px 0 rgba(34, 184, 207, 0.38)',
        'btn-glow-hover': '0 6px 20px 0 rgba(34, 184, 207, 0.55)',
      },
      borderRadius: {
        'card': '16px',
      },
      keyframes: {
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.15)' },
        }
      },
      animation: {
        'slide-up': 'slideUpFade 0.3s ease-out forwards',
        'pulse-dot': 'pulseSlow 1.8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
