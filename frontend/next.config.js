/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports to fix Turbopack slow compilation
  experimental: {
    optimizePackageImports: ['wagmi', 'viem', '@rainbow-me/rainbowkit', '@tanstack/react-query'],
  },
};

module.exports = nextConfig;
