import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import SectionHead from "./SectionHead";
import { useProducts } from "@/hooks/useProducts";

export default function NewArrivals() {
  const { data: newArrivals = [], isLoading, isError } = useProducts({ 
    limit: 8, 
    sort: "newest" 
  });

  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead
          eyebrow="New arrivals"
          title="Fresh off the rack"
          action={{ label: "All items", to: "/shop" }}
        />
      </Reveal>
      
      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-square w-full rounded-sm bg-secondary" />
              <div className="h-3 w-1/3 rounded bg-secondary" />
              <div className="h-4 w-2/3 rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          Unable to load new arrivals.
        </p>
      ) : newArrivals.length === 0 ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          No new arrivals yet. Check back soon.
        </p>
      ) : (
        <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
          {newArrivals.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}