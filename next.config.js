/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow any HTTPS image source - handles Supabase storage, placeholders, and any CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
