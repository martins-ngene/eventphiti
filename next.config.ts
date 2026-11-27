import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on your ngrok link load the dev server's assets.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.dev"],
};

export default nextConfig;
