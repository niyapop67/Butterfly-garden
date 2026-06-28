import type { MetadataRoute } from "next";

/**
 * Disallow all crawling, site-wide — belt-and-suspenders alongside the
 * per-page `robots: { index: false, follow: false }` in layout.tsx
 * (src/app/layout.tsx). This is a surprise birthday project behind a
 * passphrase gate; it has no reason to ever appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
