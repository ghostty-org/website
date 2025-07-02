/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF || '',
  },

  async headers() {
    const headers = [];
    if (process.env.VERCEL_ENV !== 'production') {
      headers.push({
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
        source: '/:path*',
      });
    }

    return headers;
  },
};

export default nextConfig;
