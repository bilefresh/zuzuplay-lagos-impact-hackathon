/** @type {import('next').NextConfig} */
const nextConfig = {
    // If using static export
    output: 'export',
      
    // Disable image optimization for static export
    images: {
      unoptimized: true,
    },
    
    // Optional: Add trailing slash for better compatibility
    trailingSlash: true,
    
    // Add headers for Unity WebGL files
    async headers() {
      return [
        {
          source: '/games/mathracer/Build/:path*.gz',
          headers: [
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000',
            },
          ],
        },
        {
          source: '/games/mathracer/Build/:path*.wasm.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/wasm',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/games/mathracer/Build/:path*.data.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/octet-stream',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
        {
          source: '/games/mathracer/Build/:path*.framework.js.gz',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/javascript',
            },
            {
              key: 'Content-Encoding',
              value: 'gzip',
            },
          ],
        },
      ];
    },
  };
export default nextConfig;
