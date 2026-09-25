import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { findProduct, relatedProducts } from "../data/products";
import { ratingSummary } from "../data/reviews";
import { formatPrice, useCart } from "../cart/CartContext";
import { ProductCard } from "./ProductCard";
import { Reviews } from "./Reviews";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = useMemo(() => (id ? findProduct(id) : undefined), [id]);
  const related = useMemo(() => (id ? relatedProducts(id, 3) : []), [id]);
  const summary = useMemo(() => (id ? ratingSummary(id) : null), [id]);

  const { add, open: openCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) {
    return (
      <section className="max-w-2xl mx-auto px-6 py-32 text-center">
        <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-4">
          Not Found
        </p>
        <h1 className="font-heading text-4xl text-primary">
          We couldn't find that piece.
        </h1>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-medium hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to the Collection
        </Link>
      </section>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) add(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) add(product);
    openCart();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-secondary mb-8"
      >
        <Link
          to="/"
          className="hover:text-primary transition-colors duration-200 cursor-pointer uppercase tracking-[0.2em]"
        >
          Shop
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to="/#catalog"
          className="hover:text-primary transition-colors duration-200 cursor-pointer uppercase tracking-[0.2em]"
        >
          {product.category}s
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="uppercase tracking-[0.2em] text-primary">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-clay border border-border/60">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={gallery[activeImage]}
                alt={`${product.name} \u2014 view ${activeImage + 1}`}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-background/85 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-secondary border border-border/60">
              {product.category}
            </span>
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((src, i) => {
                const active = i === activeImage;
                return (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-clay border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-primary ring-1 ring-primary"
                        : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:pt-4">
          <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-3">
            AuraShop · {product.category}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl text-primary leading-tight">
            {product.name}
          </h1>
          <p className="mt-3 text-secondary">{product.tagline}</p>

          {summary && summary.count > 0 && (
            <a
              href="#reviews"
              className="mt-4 inline-flex items-center gap-2 group cursor-pointer"
              aria-label={`See ${summary.count} reviews, average ${summary.average.toFixed(1)} of 5`}
            >
              <span className="inline-flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      summary.average >= i - 0.5
                        ? "text-accent fill-accent"
                        : "text-border"
                    }`}
                    strokeWidth={1.5}
                  />
                ))}
              </span>
              <span className="text-sm text-secondary group-hover:text-primary transition-colors duration-200">
                {summary.average.toFixed(1)} · {summary.count} review
                {summary.count === 1 ? "" : "s"}
              </span>
            </a>
          )}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-heading text-3xl text-primary tabular-nums">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-secondary">USD · ships in 5 days</span>
          </div>
          {product.description && (
            <p className="mt-8 text-base text-foreground/85 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Quantity + Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="inline-flex items-center self-start rounded-full border border-border bg-background overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3ch] text-center text-base text-primary tabular-nums">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                aria-label="Increase quantity"
                className="p-3 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <motion.button
              onClick={handleAdd}
              animate={justAdded ? { scale: [1, 1.03, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3.5 text-sm font-medium tracking-wide hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart · {formatPrice(product.price * qty)}
                </>
              )}
            </motion.button>

            <button
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center rounded-full border border-primary text-primary px-6 py-3.5 text-sm font-medium hover:bg-primary hover:text-on-primary transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Buy Now
            </button>
          </div>

          {/* Details list */}
          <dl className="mt-10 border-t border-border/60 divide-y divide-border/60">
            {product.dimensions && (
              <DetailRow label="Dimensions" value={product.dimensions} />
            )}
            {product.care && <DetailRow label="Care" value={product.care} />}
            <DetailRow
              label="Made by"
              value="Hand-thrown in our Portland studio"
            />
            <DetailRow
              label="Shipping"
              value="Carefully wrapped · ships within 5 business days"
            />
          </dl>
        </div>
      </div>

      {/* Reviews */}
      <div id="reviews">
        <Reviews productId={product.id} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 md:mt-28">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-3">
                You May Also Like
              </p>
              <h2 className="font-heading text-3xl md:text-4xl text-primary">
                More {product.category.toLowerCase()}s from the studio
              </h2>
            </div>
            <Link
              to="/#catalog"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      <dt className="text-[11px] uppercase tracking-[0.2em] text-secondary col-span-1">
        {label}
      </dt>
      <dd className="text-sm text-primary col-span-2 leading-relaxed">
        {value}
      </dd>
    </div>
  );
}
