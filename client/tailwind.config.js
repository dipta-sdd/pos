const { heroui } = require('@heroui/react');


/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    layout: {
      radius: {
        small: "2px",
        medium: "4px",
        large: "6px",
      },
      borderWidth: {
        small: "1px",
        medium: "1px",
        large: "2px",
      },
    },
    themes: {
      dark: {
        colors: {
          background: "#000000",
          content1: "#070d22",
          content2: "#111827",
          content3: "#1f2937",
          content4: "#374151",
          default: {
            50: "#111827",
            100: "#1f2937",
            200: "#374151",
            300: "#4b5563",
            400: "#6b7280",
            500: "#9ca3af",
            600: "#d1d5db",
            700: "#e5e7eb",
            800: "#f3f4f6",
            900: "#f9fafb",
            DEFAULT: "#181d2c",
          },
        }
      }
    }
  })],
}

module.exports = config;