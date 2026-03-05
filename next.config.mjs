const nextConfig = {
  /* config options here */
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
  output: "standalone",
};

export default nextConfig;
