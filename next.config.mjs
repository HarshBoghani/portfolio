/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'x.com', pathname: '/**' },
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'unavatar.io', pathname: '/**' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/**' },
    ],
  },
};

export default nextConfig;
