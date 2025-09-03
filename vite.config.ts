import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // 💡 adapte ici si ton backend est sur un autre port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
