/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fearless-crab-445.convex.cloud",
      },
    ],
  },
}

export default nextConfig
