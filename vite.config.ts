import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { tempo } from "tempo-devtools/dist/vite";

const conditionalPlugins: [string, Record<string, any>][] = [];

// @ts-ignore
if (process.env.TEMPO === "true") {
    conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    include: ["react", "react-dom", "react/jsx-runtime"],
    force: true,
  },
  plugins: [
    react({
      // plugins: conditionalPlugins, // remove conditional plugins
    }),
    tempo(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Explicitly add .js extension (TEMPORARY TEST)
      "@/lib": path.resolve(__dirname, "./src/lib/utils.js"), // Modified line
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/types": path.resolve(__dirname, "./src/types"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // @ts-ignore
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: "dist",
    copyPublicDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  define: {
    "process.env": {},
  },
})
