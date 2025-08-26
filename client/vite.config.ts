import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Create an async function to handle the conditional plugin
async function getPlugins() {
  const basePlugins = [
    react(),
    runtimeErrorOverlay(),
  ];

  // Conditionally add the cartographer plugin only in development and Replit environment
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    try {
      const { cartographer } = await import("@replit/vite-plugin-cartographer");
      basePlugins.push(cartographer());
    } catch (error) {
      console.warn("Cartographer plugin not available in this environment");
    }
  }

  return basePlugins;
}

export default defineConfig(async () => {
  const plugins = await getPlugins();
  
  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@shared": path.resolve(import.meta.dirname, "..", "shared"),
        "@assets": path.resolve(import.meta.dirname, "..", "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "..", "dist", "public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
