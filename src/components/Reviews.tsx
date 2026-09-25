import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { ratingSummary, reviewsFor, type Review } from "../data/reviews";

type Props = {
  productId: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export function Reviews({ productId }: Props) {
  const reviews = useMemo(() => reviewsFor(productId), [productId]);
  const summary = useMemo(() => ratingSummary(productId), [productId]);
  const [visible, setVisible] = useState(3);

  if (reviews.length === 0) {
    return (
      <section className="mt-20 md:mt-28 border-t border-border/60 pt-12 md:pt-16">
        <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-3">
          Reviews
        </p>
        <h2 className="font-heading text-3xl md:text-4xl text-primary">
          No reviews yet
        </h2>
        <p className="mt-3 text-secondary max-w-md">
          Be the first to share your experience with this piece after it arrives.
        </p>
      </section>
    );
  }

  const visibleReviews = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  return (
    <section className="mt-20 md:mt-28 border-t border-border/60 pt-12 md:pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Summary */}
        <div className="lg:col-span-4">
          <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-3">
            Customer Reviews
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-primary leading-tight">
            What the studio's customers say
          </h2>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-heading text-4xl text-primary tabular-nums">
              {summary.average.toFixed(1)}
            </span>
            <StarRow rating={summary.average} size="md" />
          </div>
          <p className="mt-2 text-sm text-secondary">
            Based on {summary.count} verified review
            {summary.count === 1 ? "" : "s"}
          </p>

          {/* Distribution */}
          <ul className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                summary.distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0;
              const pct = summary.count === 0 ? 0 : (count / summary.count) * 100;
              return (
                <li
                  key={star}
                  className="flex items-center gap-3 text-xs text-secondary"
                >
                  <span className="w-6 tabular-nums text-primary">{star}★</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums">{count}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Review list */}
        <div className="lg:col-span-8">
          <ul className="divide-y divide-border/60">
            {visibleReviews.map((review, i) => (
              <ReviewItem key={review.id} review={review} index={i} />
            ))}
          </ul>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + 3)}
                className="inline-flex items-center rounded-full border border-border bg-background px-6 py-3 text-sm text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Show more reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ review, index }: { review: Review; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="py-6 first:pt-0"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <StarRow rating={review.rating} size="sm" />
          <h3 className="font-heading text-lg text-primary mt-2 leading-tight">
            {review.title}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-primary leading-tight">{review.author}</p>
          <p className="text-xs text-secondary mt-0.5">{review.location}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground/85 leading-relaxed">
        {review.body}
      </p>

      <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-secondary">
        <span>{dateFormatter.format(new Date(review.date))}</span>
        {review.verified && (
          <>
            <span aria-hidden="true" className="text-border">
              ·
            </span>
            <span className="text-primary">Verified Buyer</span>
          </>
        )}
      </div>
    </motion.li>
  );
}

function StarRow({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half = !filled && rating >= i - 0.5;
        return (
          <span key={i} className="relative inline-flex">
            <Star className={`${dim} text-border`} strokeWidth={1.5} />
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? "50%" : "100%" }}
              >
                <Star
                  className={`${dim} text-accent fill-accent`}
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
