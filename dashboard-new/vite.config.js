import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/assets/dashboard-react/',
  plugins: [react()],
  build: {
    assetsDir: '',
    sourcemap: false,
    minify: 'esbuild',
    // Aumenta o limite do aviso (chunks de páginas grandes são esperados)
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Separa vendors pesados em chunks próprios
        manualChunks: (id) => {
          if (id.includes('node_modules/framer-motion'))  return 'vendor-motion';
          if (id.includes('node_modules/recharts'))       return 'vendor-charts';
          if (id.includes('node_modules/react-dom'))      return 'vendor-react';
          if (id.includes('node_modules/react/'))         return 'vendor-react';
          if (id.includes('node_modules/react-router'))   return 'vendor-router';
          if (id.includes('node_modules/lucide-react'))   return 'vendor-icons';
        }
      }
    }
  },
  server: {
    proxy: {
      '/get_dashboard_data.php': {
        target: 'http://localhost',
        changeOrigin: true,
      }
    }
  }
})
