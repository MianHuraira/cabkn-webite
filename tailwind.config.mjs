/** @type {import('tailwindcss').Config} */
export default {

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,jsx,ts,tsx,html}"

  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1400px",
        "2xl": "1720px",
      },
    },
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins-local)", "sans-serif"],
      },
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
        "header-slide-down": {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-from-right": {
          "0%": { opacity: "0", transform: "translateX(60px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "auth-in": "auth-in 520ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "auth-fade": "auth-fade 620ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "header-slide-down": "header-slide-down 450ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-down": "fade-in-down 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-up": "fade-in-up 350ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 300ms ease-out both",
        "scale-in": "scale-in 300ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-from-right": "slide-from-right 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#004a70",
        secondary: "#6c757d",
        success: "#28a745",
        danger: "#dc3545",
        warning: "#ffc107",
        info: "#17a2b8",
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
