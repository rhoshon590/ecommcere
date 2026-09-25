import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PRODUCTS } from "../data/products";
import { ProductCard } from "./ProductCard";

type Filter = "All" | "Mug" | "Plate";

export function Catalog() {
  const [filter, setFilter] = useState<Filter>("All");

  const items = useMemo(
    () =>
      filter === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === filter),
    [filter]
  );

  const filters: Filter[] = ["All", "Mug", "Plate"];

  return (
    <section id="catalog" className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-3">
            The Collection
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-primary">
            Everyday pieces, slowly made.
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start md:self-end" role="tablist" aria-label="Filter products">
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={`relative inline-flex items-center rounded-full px-4 min-h-11 text-xs tracking-wide transition-colors duration-200 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "text-on-primary"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{f === "All" ? "All" : `${f}s`}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
      >
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </motion.div>
    </section>
  );
}
