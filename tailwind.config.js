/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        // Animação do visto surgindo e girando
        'pop-check': {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
           '70%': { transform: 'scale(1.25) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        // Animação do pulso expansivo para fora ao clicar
        'ping-once': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        }
      },
      animation: {
        'pop-check': 'pop-check 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'ping-once': 'ping-once 0.4s ease-out forwards',
      },
      colors: {
        primary: {
          50: "#f5f0ff",
          100: "#ede5ff",
          200: "#ddd0ff",
          300: "#c4a8ff",
          400: "#a670ff",
          500: "#8b4ef5",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        accent: {
          green: "#a8e6cf",
          blue: "#b8e0f5",
          pastel: "#f5d5e3",
        },
        status: {
          paid: "#a8e6cf",
          pending: "#ffd9a8",
          overdue: "#ff9b9b",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
}
