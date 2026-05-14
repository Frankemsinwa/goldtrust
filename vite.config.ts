import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      events: 'events',
      stream: 'stream-browserify',
      buffer: 'buffer',
      util: 'util',
      process: 'process',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'events', 'util', 'stream-browserify'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
