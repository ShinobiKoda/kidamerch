import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/landing-page/Hero";
import NewArrivals from "@/components/landing-page/NewArrivals";
import CategoryTiles from "@/components/landing-page/CategoryTiles";
import EventsTeaser from "@/components/landing-page/EventsTeaser";
import NewsletterBand from "@/components/landing-page/NewsletterBrand";
import { seo, canonicalLink } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seo({
      title: "Anime Merch",
      description:
        "Heavyweight apparel, hand-finished figures, accessories and numbered prints from an independent anime merch studio. Four drops a year, no restocks.",
      keywords: [
        "anime merch",
        "anime apparel",
        "anime figures",
        "anime accessories",
        "limited drop streetwear",
        "KidaMerch",
      ],
      path: "/",
    }),
    links: canonicalLink("/"),
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <CategoryTiles />
      <EventsTeaser />
      <NewsletterBand />
    </>
  );
}