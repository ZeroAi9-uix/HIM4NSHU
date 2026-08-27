import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev origins for LAN/network access
  allowedDevOrigins: ["192.168.1.5", "localhost", "unintimidated-connately-merrilee.ngrok-free.dev","https://him-4-nshu.vercel.app/","https://him4nshu.onrender.com"],

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://him4nshu.onrender.com','https://backend-hnra.onrender.com',
  }

};

export default nextConfig;
