/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  ...(isProd ? { output: 'export' } : {}),
  distDir: 'build',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;