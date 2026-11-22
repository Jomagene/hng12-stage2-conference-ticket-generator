const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // PGlite loads WASM files from its package dir, so don't bundle it.
  serverExternalPackages: ['@electric-sql/pglite'],
  // Old single-event routes.
  async redirects() {
    return [
      { source: '/attendee-details', destination: '/', permanent: true },
      { source: '/ticket-ready', destination: '/my-tickets', permanent: true },
    ];
  },
  images: {
    remotePatterns: cloudName
      ? [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: `/${cloudName}/**` }]
      : [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
