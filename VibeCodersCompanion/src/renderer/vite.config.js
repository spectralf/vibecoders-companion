import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, '../../dist/renderer'),
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
})
