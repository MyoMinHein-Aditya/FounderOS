import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import founderBrainPlugin from './plugins/vite-plugin-brain/index.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), founderBrainPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js'
  }
})
