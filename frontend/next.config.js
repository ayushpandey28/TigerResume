const path = require('path');

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const backendBase = apiUrl.replace(/\/api\/?$/, '');

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;