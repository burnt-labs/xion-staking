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
  output: "export",
  trailingSlash: true, // This is important when deploying in GH pages
};

export default nextConfig;
