/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // /api/:path* -> FastAPI (后端服务运行在端口 8001)
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8001/:path*',
      },
    ];
  },
};

export default nextConfig;
