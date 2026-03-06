import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { paletteApiPlugin } from "./vite-plugin-palette-api"

// https://vite.dev/config/
export default defineConfig({
  plugins: [paletteApiPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5176,
    host: "127.0.0.1",
  },
})
