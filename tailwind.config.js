/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          brand: '#1275bb',
          highlight: '#0070f2',
          hover: '#0f5d96',
          active: '#0b4a79',
          canvas: '#f5f6f8',
          card: '#ffffff',
          border: '#d9e0e7',
          header: '#001a33',
          surface: '#eef2f6',
          text: '#1d2d3e',
          textMuted: '#556b82',
          success: '#107e3e',
          successBg: '#e8f5e9',
          error: '#bb0000',
          errorBg: '#fbeae9',
          warning: '#e9730c',
          warningBg: '#fff4e5',
          info: '#0064d9',
          infoBg: '#e5f3ff'
        }
      },
      fontFamily: {
        sans: ['"72"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"72Mono"', 'Consolas', 'Monaco', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'fiori': '0 0 0 1px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        'fiori-card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'fiori-modal': '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
