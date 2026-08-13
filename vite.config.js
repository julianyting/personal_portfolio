import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project at /<repo-name>/. The router reads the same
  // value via import.meta.env.BASE_URL, so both stay in step. Change this to '/'
  // if the site ever moves to a domain root.
  base: '/personal_portfolio/',
})
