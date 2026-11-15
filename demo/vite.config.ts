import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' để chạy được khi deploy lên GitHub Pages (đường dẫn con /seminar_se347/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
