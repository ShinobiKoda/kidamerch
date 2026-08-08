import { Link } from "@tanstack/react-router";

import { categories } from "@/data/products";

import { Reveal, Stagger, StaggerItem, EASE } from "@/components/Reveal";
import SectionHead from "./SectionHead";

export default function CategoryTiles() {
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
              className="group relative block aspect-16/10 overflow-hidden rounded-sm border border-border sm:aspect-4/5"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-drop group-hover:scale-105"
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
