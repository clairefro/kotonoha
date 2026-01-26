import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Use backend service name in Docker (prod), localhost in dev
  const isProd = mode === "production";
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "shared-types": path.resolve(__dirname, "../../packages/shared-types"),
      },
    },
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": isProd ? "http://backend:4000" : "http://localhost:4000",
      },
    },
  };
});
