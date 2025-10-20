import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
  },
  server: {
    allowedHosts: ['www.sobut.shop', '.sobut.shop'],
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
