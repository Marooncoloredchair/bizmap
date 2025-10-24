import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'leaflet'
            }
            if (id.includes('dompurify')) {
              return 'utils'
            }
            return 'vendor'
          }
          // Split app code
          if (id.includes('src/components/MapComponent') || id.includes('src/components/LazyMap')) {
            return 'map'
          }
          if (id.includes('src/components/ResultsDisplay')) {
            return 'results'
          }
          if (id.includes('src/components/AISearchInterface')) {
            return 'ai'
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

