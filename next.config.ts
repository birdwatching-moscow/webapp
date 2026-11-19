import type { NextConfig } from "next";

export const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  webpack(config, { isServer, webpack }) {
    // Some packages (jose, next-auth internals) use `node:` URI scheme.
    // Webpack 5 doesn't handle it by default — strip the prefix so normal
    // resolution + fallbacks apply.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
        resource.request = resource.request.replace(/^node:/, '')
      })
    )

    if (!isServer) {
      // These Node.js built-ins have no browser equivalent; replace with empty modules.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        url: false,
        crypto: false,
        stream: false,
        buffer: false,
        path: false,
        fs: false,
      }
    }

    return config
  },
  reactCompiler: true,
  experimental: {
    agentUpgrade: "security",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.yandexcloud.net",
      },
      // Dev/seed placeholder data
      {
        protocol: "https",
        hostname: "placeholder.example.com",
      },
    ],
  },
  async redirects() {
    // The private events page was renamed; keep old links and search results working
    return [
      { source: "/private-events", destination: "/private", permanent: true },
      // Personal walks page became the parks page
      { source: "/private-walks", destination: "/private-parks", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
