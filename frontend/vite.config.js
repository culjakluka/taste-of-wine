import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // same job as "proxy" in CRA's package.json: /api/... goes to the backend
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
