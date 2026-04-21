/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
    devIndicators: false,
    experimental: {
        allowedDevOrigins: ['192.168.0.249', 'localhost:3000']
    },
    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;
