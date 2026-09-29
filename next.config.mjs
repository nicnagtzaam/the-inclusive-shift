/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // required for the slim Cloud Run container image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // Restrict Server Actions to known origins (defence-in-depth alongside CSRF checks in lib/csrf.ts)
      allowedOrigins: [
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") ?? "localhost:3000",
      ],
    },
  },
};

export default nextConfig;
