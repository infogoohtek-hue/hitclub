/** @type {import('next').NextConfig} */
const nextConfig = (phase) => ({ poweredByHeader: false, distDir: phase === 'phase-development-server' ? '.next-dev' : '.next' });
export default nextConfig;
