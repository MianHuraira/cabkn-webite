/** @type {import('tailwindcss').Config} */
export default {
  
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,html}"

  ],
  theme: {
    extend: {
      keyframes: {
        "auth-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(14px) scale(0.985)",
          },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "auth-fade": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "auth-in": "auth-in 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "auth-fade": "auth-fade 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eff9ff",
          100: "#d7f0ff",
          200: "#b7e2ff",
          300: "#86ceff",
          400: "#4fb4ff",
          500: "#188fe0",
          600: "#004a70",
          700: "#003c5a",
          800: "#002f46",
          900: "#002639",
          950: "#001a26",
        },
      },
    },
  },
  plugins: [],
};
