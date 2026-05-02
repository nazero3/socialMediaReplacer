/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 15.5+: top-level flag (was `experimental.typedRoutes`)
  typedRoutes: false,
  transpilePackages: ['@smr/types', '@smr/theme', '@smr/ui', '@smr/content'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
