// src/routes/sitemap[.]xml.ts
// Serves /sitemap.xml. Static routes are hardcoded below; the dynamic section
// pulls products + categories from Supabase so new drops show up automatically.
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: 1.0 },
  { loc: "/shop", changefreq: "daily", priority: 0.9 },
  { loc: "/events", changefreq: "weekly", priority: 0.6 },
  { loc: "/about", changefreq: "monthly", priority: 0.4 },
  { loc: "/contact", changefreq: "monthly", priority: 0.3 },
];

async function getDynamicUrls(): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = [];

  try {
    // --- Categories -----------------------------------------------------
    const { data: categories } = await supabase
      .from("categories")
      .select("name, created_at");

    for (const category of categories ?? []) {
      urls.push({
        loc: `/shop?category=${encodeURIComponent(category.name)}`,
        lastmod: category.created_at,
        changefreq: "weekly",
        priority: 0.7,
      });
    }

    // --- Products ---------------------------------------------------------
    const { data: products } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("is_active", true);

    for (const product of products ?? []) {
      const entry: SitemapUrl = {
        loc: `/product/${product.id}`,
        changefreq: "weekly",
        priority: 0.8,
      };
      if (product.created_at) {
        entry.lastmod = product.created_at;
      }
      urls.push(entry);
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap URLs:", error);
  }

  return urls;
}

function toXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : "";
      const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : "";
      const priority =
        url.priority !== undefined ? `\n    <priority>${url.priority}</priority>` : "";
      return `  <url>\n    <loc>${SITE_URL}${url.loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const dynamicUrls = await getDynamicUrls();
        const xml = toXml([...STATIC_ROUTES, ...dynamicUrls]);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
          },
        });
      },
    },
  },
});