import { Link } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import SectionHead from "./SectionHead";
import { useCategories } from "@/hooks/useCategories";

export default function CategoryTiles() {
  const { data: categories = [], isLoading, isError } = useCategories();

  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead eyebrow="Browse" title="By category" />
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-16/10 sm:aspect-4/5 w-full animate-pulse rounded-sm border border-border bg-secondary"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          Unable to load categories.
        </p>
      ) : categories.length === 0 ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          No categories available right now.
        </p>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Link
                to="/shop"
                search={{ category: c.name }}
                className="group relative block aspect-16/10 overflow-hidden rounded-sm border border-border sm:aspect-4/5"
              >
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-drop group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-2" />
                )}
                <span className="absolute inset-0 bg-ink/45 transition-colors duration-300 group-hover:bg-ink/25" />
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="display-xl block text-2xl text-white">{c.name}</span>
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}