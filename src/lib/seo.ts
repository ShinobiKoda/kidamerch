
export const SITE_URL = "https://kidamerch-ichi.vercel.app/"; 
export const SITE_DESCRIPTION =
  "Independent anime merch studio. Small-run drops of heavyweight apparel, hand-finished figures, accessories and numbered prints.";
  export const SITE_NAME = "KidaMerch";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const TWITTER_HANDLE = ""; // e.g. "@kidamerch" — leave empty string to omit the tag
export const SOCIAL_LINKS: string[] = [
  // "https://instagram.com/kidamerch",
  // "https://twitter.com/kidamerch",
  // "https://tiktok.com/@kidamerch",
]; // TODO: fill in real profile URLs — used in Organization schema `sameAs`

interface SeoOptions {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  /** Path only, e.g. "/shop" or "/products/naruto-tee". Defaults to "/". */
  path?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
}

type MetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

/**
 * Builds the meta array for a route's head(). Spread it into the meta array:
 *
 *   head: () => ({ meta: [...seo({ title, description })] })
 */
export function seo({
  title,
  description,
  keywords,
  image = DEFAULT_OG_IMAGE,
  path = "/",
  type = "website",
  noIndex = false,
}: SeoOptions): MetaTag[] {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  const tags: (MetaTag | false | undefined)[] = [
    { title: fullTitle },
    { name: "description", content: description },
    keywords && keywords.length > 0
      ? { name: "keywords", content: keywords.join(", ") }
      : undefined,
    { name: "robots", content: noIndex ? "noindex, nofollow" : "index, follow" },
    { name: "author", content: SITE_NAME },

    // Open Graph
    { property: "og:type", content: type },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "en_US" },

    // Twitter / X
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    TWITTER_HANDLE ? { name: "twitter:site", content: TWITTER_HANDLE } : undefined,
  ];

  return tags.filter(Boolean) as MetaTag[];
}

/** Builds the `links` array entry for canonical URLs. */
export function canonicalLink(path = "/") {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return [{ rel: "canonical", href: url }];
}

/** Site-wide Organization schema — put this once, in __root.tsx. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    description: SITE_DESCRIPTION,
    ...(SOCIAL_LINKS.length > 0 ? { sameAs: SOCIAL_LINKS } : {}),
  };
}

/** Site-wide WebSite schema — put this once, in __root.tsx. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

/**
 * Product schema for individual product pages.
 * Call this from your product route's head() once you have the product loaded.
 */
export function productSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${product.path}`,
      priceCurrency: product.currency ?? "NGN",
      price: product.price,
      availability: `https://schema.org/${product.availability ?? "InStock"}`,
    },
  };
}

/** Breadcrumb schema — pass an ordered list of { name, path }. */
export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}