import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 정적 사이트 생성
  basePath: '/character-maker', // GitHub Pages 서브패스
};

export default nextConfig;
