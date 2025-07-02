/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || '',
  },
};

export default nextConfig;
