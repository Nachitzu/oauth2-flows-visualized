/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        severity: {
          safe: '#22c55e',
          risk: '#f59e0b',
          critical: '#ef4444',
        },
        actor: {
          user: '#8b5cf6',
          client: '#3b82f6',
          authServer: '#10b981',
          resourceServer: '#f59e0b',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow-right': 'flowRight 1s ease-in-out infinite',
        'flow-left': 'flowLeft 1s ease-in-out infinite',
      },
      keyframes: {
        flowRight: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
        flowLeft: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-6px)' },
        },
      },
    },
  },
  plugins: [],
}