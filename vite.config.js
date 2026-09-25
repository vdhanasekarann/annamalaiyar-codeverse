import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envPrefix: [
    "VITE_API_BASE",
    "VITE_APP_URL",
    "VITE_GOOGLE_CLIENT_ID",
    "VITE_RAZORPAY_KEY_ID",
  ],
  server: {
    port: 5173,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      // proxy any /api requests to backend on :3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});