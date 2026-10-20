import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Erlaubt eigenständiges Laden in Electron ohne laufenden Webserver
  server: {
    port: 5173,
    proxy: {
      '/bzst-api': {
        target: 'https://api.evatr.vies.bzst.de',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bzst-api/, ''),
      },
    },
  },
})
