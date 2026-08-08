import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatPrice } from "@/data/products";
import type { Product } from '@/types/storefront'

import { useStore } from "@/lib/store";
import { EASE } from "./Reveal";

export function WishlistButton({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { isWished, toggleWishlist } = useStore();
  const wished = isWished(product.id);
  return (
    <button
      type="button"
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // toggleWishlist(product);
      }}
      className={`grid h-11 w-11 place-items-center rounded-full border border-border bg-background/85 backdrop-blur-sm transition-colors duration-200 hover:border-primary ${className}`}
    >
      <motion.span
        key={String(wished)}
        initial={{ scale: 0.6 }}
        animate={{ scale: [0.6, 1.25, 1] }}
        transition={{ duration: 0.32, ease: EASE }}
        className="grid place-items-center"
      >
        <Heart
          size={16}
          className={wished ? "text-primary" : "text-foreground"}
          fill={wished ? "currentColor" : "none"}
        />
      </motion.span>
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const reduce = useReducedMotion();
  const second = product.images[1]?.url ?? product.images[0]?.url;

  return (
    <motion.article
      className="group relative"
      {...(reduce ? {} : { whileHover: { y: -6 } })}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <div className="relative aspect-4/5 overflow-hidden rounded-sm border border-border bg-surface-2">
          <img
            src={product.images[0]?.url}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-drop group-hover:scale-[1.04] group-hover:opacity-0"
          />
          <img
            src={second}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0 transition-[opacity,transform] duration-500 ease-drop group-hover:scale-100 group-hover:opacity-100"
          />

          {product.category && (
            <span className="eyebrow absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1.5 text-[10px] text-white">
              {product.category}
            </span>
          )}
          {!product.isActive && (
            <span className="eyebrow absolute left-3 bottom-3 rounded-full bg-background px-3 py-1.5 text-[10px] text-muted-foreground">
              Sold out
            </span>
          )}

          <div className="absolute right-3 top-3">
            <WishlistButton product={product} />
          </div>

          <div className="absolute inset-x-3 bottom-3 md:translate-y-3 md:opacity-0 md:transition-all md:duration-300 md:ease-drop md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <button
              type="button"
              disabled={!product.isActive}
              onClick={(e) => {
                e.preventDefault();
                // addToCart(product, product.variants[0] ?? null);
              }}
              className="eyebrow h-11 w-full rounded-sm bg-primary text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
            >
              {product.isActive ? "Add to cart" : "Unavailable"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-[10px] text-muted-foreground">{product.category}</p>
            <h3 className="mt-1 truncate text-[15px] font-semibold tracking-tight">
              {product.name}
            </h3>
          </div>
          <p className="shrink-0 text-[15px] font-semibold text-primary tabular-nums">
            {formatPrice(product.basePrice)}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
