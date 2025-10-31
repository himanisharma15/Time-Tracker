import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: add a dev-time proxy so calls to /api are forwarded to the
// backend server running on port 4000. This mirrors how the production
// deployment expects the frontend to call /api.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://time-tracker-backend-1.onrender.com',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
})
