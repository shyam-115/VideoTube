import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,       // bind to 0.0.0.0 for container environments
    port: 5173,
  },
  preview: {
    host: true,       // required for Render's health check to succeed
    port: 4173,
  },
})
