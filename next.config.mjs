/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
        ],
    },
    devIndicators: false,
    turbopack: {
        root: process.cwd(),
    },
};

export default nextConfig;
