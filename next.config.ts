import type { NextConfig } from "next";

export const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
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
