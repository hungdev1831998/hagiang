import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import figmaStops from './scripts/figma-stops.js'

// Ảnh gốc duy nhất: public/img/figma/new ở gốc repo
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

export default defineConfig({
  publicDir,
  plugins: [react(), tailwindcss(), figmaStops(`${publicDir}/img/figma/new`)],
})
