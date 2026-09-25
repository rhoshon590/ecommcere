import { motion } from "framer-motion";
import { Plus, Check, Star } from "lucide-react";
import { useMemo, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../data/products";
import { ratingSummary } from "../data/reviews";
import { formatPrice, useCart } from "../cart/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const summary = useMemo(() => ratingSummary(product.id), [product.id]);

  const handleQuickAdd = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.article
      layout
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex flex-col bg-background rounded-2xl overflow-hidden border border-border/70 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-20px_rgba(28,25,23,0.25)] transition-shadow duration-300"
    >
      <Link
        to={`/product/${product.id}`}
        className="flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-clay">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-background/85 backdrop-blur-sm px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-secondary border border-border/60">
            {product.category}
          </span>

          <motion.button
            onClick={handleQuickAdd}
            aria-label={`Quick add ${product.name} to cart`}
            initial={false}
            animate={justAdded ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-primary text-on-primary pl-3 pr-4 min-h-11 text-xs font-medium shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 transition-all duration-300 cursor-pointer touch-manipulation hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Quick Add
              </>
            )}
          </motion.button>
        </div>

        <div className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <h3 className="font-heading text-xl text-primary leading-snug truncate">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-secondary tracking-wide">
              {product.tagline}
            </p>
            {summary.count > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" strokeWidth={1.5} />
                <span className="text-xs text-secondary tabular-nums">
                  {summary.average.toFixed(1)}
                  <span className="text-border"> · </span>
                  {summary.count}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-primary whitespace-nowrap mt-1">
            {formatPrice(product.price)}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
