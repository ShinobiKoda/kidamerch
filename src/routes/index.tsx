import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import heroImg from "@/assets/hero-figure.jpg";
import { categories, products } from "@/data/products";
import { events, formatEventDate, isUpcoming } from "@/data/events";
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem, EASE } from "@/components/Reveal";

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

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);

  const step = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE },
  });

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 md:min-h-[calc(100svh-5rem)] md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-24">
        <div className="relative order-2 md:order-1">
          <motion.p {...step(0)} className="eyebrow text-primary">
            Drop 04 · Live now
          </motion.p>
          <motion.h1
            {...step(1)}
            className="display-xl mt-5 text-[15vw] leading-[0.88] sm:text-7xl lg:text-8xl"
          >
            Sharp
            <br />
            edges,
            <br />
            <span className="text-primary">quiet</span> rooms
          </motion.h1>
          <motion.p
            {...step(2)}
            className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground"
          >
            Original anime-inspired merch built like garments, not souvenirs. Small runs,
            numbered editions, and nothing we wouldn't wear ourselves.
          </motion.p>
          <motion.div {...step(3)} className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="eyebrow inline-flex h-14 items-center gap-2 rounded-sm bg-primary px-7 text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            >
              Shop the drop <ArrowRight size={15} />
            </Link>
            <Link
              to="/events"
              className="eyebrow inline-flex h-14 items-center rounded-sm border border-border px-7 transition-colors duration-200 hover:bg-secondary"
            >
              View events
            </Link>
          </motion.div>
          <motion.dl {...step(4)} className="mt-14 grid max-w-md grid-cols-3 gap-6 rule-line pt-6">
            {[
              ["24", "Pieces in drop"],
              ["120", "Lowest edition"],
              ["4", "Drops a year"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="display-xl text-2xl">{n}</dt>
                <dd className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="relative order-1 md:order-2">
          <div className="hero-glow pointer-events-none absolute inset-x-6 top-10 h-2/3 opacity-60" />
          <motion.div
            style={{ y, scale }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="relative aspect-[4/5] overflow-hidden rounded-sm border border-border bg-surface-2 shadow-lift"
          >
            <img
              src={heroImg}
              alt="Hand-painted anime-inspired warrior statue in black and crimson"
              width={1200}
              height={1504}
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
            className="absolute -bottom-5 left-4 rounded-sm border border-border bg-background px-5 py-4 shadow-elevate sm:left-8"
          >
            <p className="eyebrow text-[10px] text-muted-foreground">Now shipping</p>
            <p className="mt-1 text-sm font-semibold">Crimson Blade 1/7 Statue</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; to: string };
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pb-8">
      <div className="min-w-0">
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h2 className="display-xl mt-3 text-4xl sm:text-5xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to as never}
          className="eyebrow inline-flex shrink-0 items-center gap-1.5 pb-2 text-[10px] text-muted-foreground transition-colors duration-150 hover:text-primary"
        >
          {action.label} <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}

function NewArrivals() {
  const featured = products.slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead
          eyebrow="New arrivals"
          title="Fresh off the rack"
          action={{ label: "All items", to: "/shop" }}
        />
      </Reveal>
      <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
        {featured.map((p) => (
          <StaggerItem key={p.id}>
            <ProductCard product={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function CategoryTiles() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead eyebrow="Browse" title="By category" />
      </Reveal>
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <StaggerItem key={c.name}>
            <Link
              to="/shop"
              search={{ category: c.name } as never}
              className="group relative block aspect-[16/10] overflow-hidden rounded-sm border border-border sm:aspect-[4/5]"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-ink/45 transition-colors duration-300 group-hover:bg-ink/25" />
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="display-xl block text-2xl text-white">{c.name}</span>
                <span className="mt-1 block text-xs text-white/70">{c.blurb}</span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function EventsTeaser() {
  const upcoming = events.filter((e) => isUpcoming(e.date)).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead
          eyebrow="In person"
          title="Where to find us"
          action={{ label: "All events", to: "/events" }}
        />
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-3">
        {upcoming.map((e) => (
          <StaggerItem key={e.id}>
            <Link
              to="/events"
              className="group block overflow-hidden rounded-sm border border-border bg-card transition-shadow duration-300 hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={e.cover}
                  alt={e.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="eyebrow text-[10px] text-primary">
                  {e.kind} · {formatEventDate(e.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{e.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{e.location}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function NewsletterBand() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
      <Reveal>
        <div className="rounded-sm border border-border bg-surface px-6 py-14 text-center sm:px-12">
          <p className="eyebrow text-primary">Drop 05 · November</p>
          <h2 className="display-xl mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">
            Get first access
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            One email per drop. Early links, edition sizes, and event invites. No noise.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="h-14 min-w-0 flex-1 rounded-sm border border-input bg-background px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
            />
            <button
              type="submit"
              className="eyebrow h-14 shrink-0 rounded-sm bg-primary px-7 text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            >
              Notify me
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
