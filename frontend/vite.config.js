import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDevelopment = command === 'serve';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 3001,
      open: false,
      watch: {
        usePolling: true,
      },
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['../..']
      }
    },
    resolve: {
      alias: isDevelopment ? {
        '@cidqueiroz/cdkteck-ui': path.resolve(__dirname, '../../cdkteck-ui/src')
      } : {},
      dedupe: ['react', 'react-dom']
    },
    optimizeDeps: {
      exclude: ['@cidqueiroz/cdkteck-ui']
    }
  }
});