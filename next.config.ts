import type { NextConfig } from "next";

// The site is static HTML built from site/ into public/ (python site/publish.py).
// These rewrites give it clean URLs; app/api/leads stays a Next.js route for the demo form.
const pages = "products|analytics|how-it-works|deployment|integrations|services";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/home.html" },
      { source: `/:page(${pages})`, destination: "/:page.html" },
    ];
  },
};

export default nextConfig;
