import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Set VITE_BASE_PATH to your repository name when deploying manually.
// Example: VITE_BASE_PATH=/currency_exchange/ npm run build
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || '/currency_exchange/',
})
