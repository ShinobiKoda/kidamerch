import { createFileRoute,  } from "@tanstack/react-router";
import Hero from "@/components/landing-page/Hero"
import NewArrivals from "@/components/landing-page/NewArrivals"
import CategoryTiles from "@/components/landing-page/CategoryTiles"
import EventsTeaser from "@/components/landing-page/EventsTeaser"
import NewsletterBand from "@/components/landing-page/NewsletterBrand"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KidaMerch — Anime Merch, Drop 04" },
      {
        name: "description",
        content:
          "Drop 04 is live: heavyweight apparel, hand-finished figures, accessories and numbered prints from an independent anime merch studio.",
      },
      { property: "og:title", content: "KidaMerch — Anime Merch, Drop 04" },
      {
        property: "og:description",
        content: "Independent anime merch in small runs. Four drops a year, no restocks.",
      },
    ],
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
