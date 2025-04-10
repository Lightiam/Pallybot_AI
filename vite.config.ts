import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['lucide-react', 'react-hot-toast', 'lottie-react'],
          'date': ['date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});