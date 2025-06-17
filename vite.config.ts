import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'],
        presets: ['@babel/preset-react', '@babel/preset-typescript']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    open: true,
    // Enable HMR
    hmr: true,
    // Enable CORS
    cors: true
  },
  build: {
    // Enable source maps in production
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-avatar', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
}) 