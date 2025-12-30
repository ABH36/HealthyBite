/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Professional Font
      },
      colors: {
        // 🎨 HealthyBite Premium Palette
        'brand-green': '#1DBF73', // Emerald Green (Trust)
        'brand-blue': '#3ECFFF',  // Sky Blue (Medical/Hygiene)
        'brand-red': '#FF6B6B',   // Soft Red (Alert but calm)
        'brand-dark': '#0F172A',  // Deep Navy (Text)
        'brand-bg': '#F7FDFB',    // Off-white Mint (Background)
      },
      animation: {
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}