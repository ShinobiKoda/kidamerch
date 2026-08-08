
import { ProductCard } from "@/components/ProductCard";
import { Reveal, Stagger, StaggerItem, EASE } from "@/components/Reveal";
import type { Product } from '@/types/storefront'
import SectionHead from "./SectionHead";
import {useProducts} from "@/hooks/useProducts";



export default function NewArrivals() {
  const { data: newArrivals, isLoading, isError } = useProducts();
  
  // Changed to show all products for testing (removed .slice(0, 6))
  const featured = newArrivals || [];

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
        <div className="py-12 text-center text-sm text-gray-500">
          Loading products...
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-red-500">
          Failed to load products.
        </div>
      ) : featured.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          No products found.
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-6">
          {featured.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}
