import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import path from "path";

    // https://vitejs.dev/config/
    export default defineConfig({
      base: "/",
      optimizeDeps: {
        entries: ["src/main.tsx", "src/tempobook/**/*"],
        include: ["react", "react-dom", "react/jsx-runtime"],
        force: true,
      },
      plugins: [
        react(),
      ],
      resolve: {
        preserveSymlinks: true,
        alias: {
          "@": path.resolve(__dirname, "./src"),
          "@/lib": path.resolve(__dirname, "./src/lib"),
          "@/components": path.resolve(__dirname, "./src/components"),
          "@/types": path.resolve(__dirname, "./src/types"),
        },
      },
      server: {
        host: '0.0.0.0',
        port: 6000, // Specify a different default port
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
    });
