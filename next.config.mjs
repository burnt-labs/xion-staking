import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const useProxy = false;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.QUICK_BUILD === "true",
  },
  images: {
    remotePatterns: [
      {
        hostname: "s3.amazonaws.com",
        pathname: "**",
        port: "",
        protocol: "https",
      },
    ],
  },
  trailingSlash: true, // This is important when deploying in GH pages
  typescript: {
    ignoreBuildErrors: process.env.QUICK_BUILD === "true",
  },
  ...(useProxy
    ? {
        rewrites: async () => [
          {
            destination: "https://rpc.xion-testnet-1.burnt.com:443",
            source: "/rpc",
          },
        ],
      }
    : {
        output: "export",
      }),
};

if (process.env.NODE_ENV === "development") {
  await setupDevPlatform();
}

export default nextConfig;
