/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-muted': '#f1f5f9',
        border: '#e2e8f0',
        'text-primary': '#0f172a',
        'text-secondary': '#64748b',
        success: '#16a34a',
        warning: '#d97706',
        danger: '#dc2626',
        accent: '#4f46e5',
        // Executive pastel weekly themes
        week1: {
          light: '#f0fdfa',
          border: '#ccfbf1',
          text: '#134e4a',
          badge: '#0d9488',
          ring: '#0f766e',
        },
        week2: {
          light: '#f0fdf4',
          border: '#dcfce7',
          text: '#14532d',
          badge: '#16a34a',
          ring: '#15803d',
        },
        week3: {
          light: '#fff1f2',
          border: '#ffe4e6',
          text: '#881337',
          badge: '#e11d48',
          ring: '#be123c',
        },
        week4: {
          light: '#fffbeb',
          border: '#fef3c7',
          text: '#78350f',
          badge: '#d97706',
          ring: '#b45309',
        },
        week5: {
          light: '#faf5ff',
          border: '#f3e8ff',
          text: '#581c87',
          badge: '#9333ea',
          ring: '#7e22ce',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
