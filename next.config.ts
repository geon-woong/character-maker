import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  basePath: '/character-maker', // GitHub Pages 서브패스
};

export default nextConfig;
