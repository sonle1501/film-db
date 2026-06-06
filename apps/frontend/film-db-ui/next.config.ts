/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  rewrites: () => {
    const backendUrl = process.env.INTERNAL_API_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
