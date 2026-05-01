const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: isStaticExport ? 'export' : undefined,
  images: isStaticExport ? { unoptimized: true } : undefined,
  trailingSlash: isStaticExport,
  basePath,
  assetPrefix: basePath || undefined,
  typedRoutes: false,
  transpilePackages: ['@smr/types', '@smr/theme', '@smr/ui', '@smr/content'],
  ...(isStaticExport
    ? {}
    : {
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
      }),
};

export default nextConfig;
