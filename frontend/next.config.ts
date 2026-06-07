import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev origins for LAN/network access
  allowedDevOrigins: ["192.168.1.5", "localhost", "unintimidated-connately-merrilee.ngrok-free.dev"],

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  }

};

export default nextConfig;
