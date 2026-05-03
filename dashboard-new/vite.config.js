import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rolldownOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/lucide-react')) return 'vendor-lucide';
          if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (id.includes('node_modules/recharts')) return 'vendor-charts';
          if (id.includes('node_modules/react')) return 'vendor-react';
        }
      }
    }
  },
  server: {
    proxy: {
      '/get_dashboard_data.php': {
        target: 'http://localhost', // Ajuste para o endereço do seu servidor PHP (XAMPP/WAMP/etc)
        changeOrigin: true,
      }
    }
  }
})
