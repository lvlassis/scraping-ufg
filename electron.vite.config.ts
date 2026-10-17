import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/renderer/src')
      }
    },
    plugins: [vue(), tailwindcss()],
    server: {
      host: '127.0.0.1',
      watch: {
        usePolling: true,
      },
    }
  }
})
