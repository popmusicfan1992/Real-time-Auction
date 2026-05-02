import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images from external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
    // Reduce image quality slightly for faster loads
    formats: ["image/avif", "image/webp"],
  },
  // Enable compression
  compress: true,
  // Optimize package imports
  experimental: {
    optimizePackageImports: ["@stripe/stripe-js", "socket.io-client"],
  },
};

export default nextConfig;
