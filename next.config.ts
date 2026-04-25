import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // Pyodide loads WASM from a CDN; no special config needed client-side.
};

export default nextConfig;
