import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { gameApi } from './backend'

export default defineConfig({
  plugins: [react(), gameApi()],
  // Reachable from other devices on the same network (presenter on a phone, projector on another laptop).
  server: { host: true },
  preview: { host: true },
})
