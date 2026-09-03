/**
 * Static export only. GitHub Pages serves this from a subpath when it is a
 * project page, so basePath comes from the environment at build time and is
 * empty for local development.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
}

export default nextConfig
