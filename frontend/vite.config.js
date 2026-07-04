import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Expose CRA-style REACT_APP_* variables to code that reads process.env.*
  const processEnv = Object.fromEntries(
    Object.entries(env)
      .filter(([k]) => k.startsWith("REACT_APP_") || k === "NODE_ENV")
      .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)])
  );

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      ...processEnv,
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    envPrefix: ["VITE_", "REACT_APP_"],
    server: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
        protocol: "wss",
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: "build",
      sourcemap: false,
    },
  };
});
