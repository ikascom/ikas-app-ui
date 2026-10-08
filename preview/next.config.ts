import path from "node:path"
import type { NextConfig } from "next"

const repoRoot = path.join(import.meta.dirname, "..")

/**
 * Static preview pages embedded by builders.ikas.com via iframe.
 * Output is copied into builders' public/ui-preview, hence the basePath.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ui-preview",
  trailingSlash: false,
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
  allowedDevOrigins: ["*.trycloudflare.com"],
}

export default nextConfig
