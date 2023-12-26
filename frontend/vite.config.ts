import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "node:path";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),nodePolyfills(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
