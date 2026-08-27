import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Cache Components inverts Next's default: data fetching becomes dynamic
   * unless explicitly cached, rather than pages being statically prerendered
   * at build time.
   *
   * That matters here because this is a CMS-backed site. Under the default
   * model the homepage was prerendered at build, so content published through
   * the admin would not appear until the next deploy — the classic "I clicked
   * publish and nothing changed" bug. With this on, every read is fresh unless
   * we opt it into a cache with `use cache` + `cacheTag`, and publishing
   * invalidates precisely those tags.
   */
  cacheComponents: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Scoped to this cloud's own path so the optimizer cannot be used as
        // an open proxy for arbitrary Cloudinary accounts.
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME ?? "*"}/**`,
      },
    ],
  },
};

export default nextConfig;
