import type { NextConfig } from "next";

// ryane008.github.io is a GitHub Pages *user* site, so it is served from the
// domain root: no basePath. `output: "export"` writes a fully static site to out/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
