/** @type {import('next').NextConfig} */

// GitHub Pages: we infer the repo name in CI via GITHUB_REPOSITORY=owner/repo
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd && repo ? `/${repo}` : '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true }
};

module.exports = nextConfig;
