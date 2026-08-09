import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import heroImg from "@/assets/hero-figure.jpg";

import { EASE } from "@/components/Reveal";
import { useHeroProduct, useActiveProductCount } from "@/hooks/useProducts";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08]);

  const { data: heroData, isLoading } = useHeroProduct();
  const { data: activeCount, isLoading: countLoading } = useActiveProductCount();

  const featured = heroData;

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
            Original anime-inspired merch built like garments, not souvenirs. Small runs, numbered
            editions, and nothing we wouldn't wear ourselves.
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
              [countLoading ? null : String(activeCount ?? 0), "Pieces in drop"],
              ["120", "Lowest edition"],
              ["4", "Drops a year"],
            ].map(([n, label]) => (
              <div key={label}>
                <dt className="display-xl text-2xl">
                  {n === null ? (
                    <div className="mt-1 h-7 w-10 animate-pulse rounded bg-muted" />
                  ) : (
                    n
                  )}
                </dt>
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
            className="relative aspect-4/5 overflow-hidden rounded-sm border border-border bg-surface-2 shadow-lift"
          >
            {isLoading ? (
              <div className="h-full w-full animate-pulse bg-muted" />
            ) : (
              <img
                src={featured?.imageUrl || heroImg}
                alt={featured?.name || "Hand-painted anime-inspired warrior statue in black and crimson"}
                width={1200}
                height={1504}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
            className="absolute -bottom-5 left-4 rounded-sm border border-border bg-background px-5 py-4 shadow-elevate sm:left-8"
          >
            <p className="eyebrow text-[10px] text-muted-foreground">Now shipping</p>
            {isLoading ? (
              <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <p className="mt-1 text-sm font-semibold">
                {featured?.name || "Crimson Blade 1/7 Statue"}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}