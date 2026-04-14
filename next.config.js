/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // Firebase Storage + any CDN
    ],
  },
}
module.exports = nextConfig
