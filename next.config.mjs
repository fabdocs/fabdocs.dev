import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Canonical host: send www.fabdocs.dev -> fabdocs.dev, preserving the path.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.fabdocs.dev' }],
        destination: 'https://fabdocs.dev/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Serve the Markdown representation of a docs page at `<path>.md`.
      // (The `Accept: text/markdown` negotiation that the old proxy.ts did
      // needs edge middleware, which the Cloudflare adapter can't bundle yet.)
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*/content.md',
      },
    ];
  },
};

export default withMDX(config);

// Enables Cloudflare bindings (KV, R2, etc.) during `next dev`.
// Safe no-op outside the Cloudflare toolchain.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
