import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  },
  // --- THIS SECTION HAS BEEN CORRECTED ---
  server: {
    host: true, // This is good, it allows access from other devices on your network.
    // We remove the `port: 3000` to avoid conflicts with the backend.
    proxy: {
      // This new rule tells Vite: "If you see a request starting with /api,
      // forward it to my backend server, which is running on port 3000."
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  // ------------------------------------
  preview: {
    host: true,
    port: 3000, // This is for previewing the build, it's okay to leave as is.
  }
});

