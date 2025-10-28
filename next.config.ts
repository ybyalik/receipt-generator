import type { NextConfig } from "next";

const replitDomains = process.env.REPLIT_DOMAINS 
  ? process.env.REPLIT_DOMAINS.split(',') 
  : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(replitDomains.length > 0 && {
    allowedDevOrigins: replitDomains,
  }),
};

export default nextConfig;
