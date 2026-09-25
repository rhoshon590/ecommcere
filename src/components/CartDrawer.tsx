import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice, useCart } from "../cart/CartContext";

type Props = {
  onCheckout: () => void;
};

export function CartDrawer({ onCheckout }: Props) {
  const { isOpen, close, lines, setQty, remove, subtotal, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-label="Shopping cart">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="absolute top-0 right-0 h-full w-full sm:w-[28rem] bg-background shadow-2xl flex flex-col"
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-border/70">
              <div>
                <h2 className="font-heading text-2xl text-primary leading-tight">
                  Your Cart
                </h2>
                <p className="text-xs text-secondary mt-0.5">
                  {itemCount === 0
                    ? "Nothing here yet"
                    : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Close cart"
                className="rounded-full p-2 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto scroll-elegant px-6 py-4">
              {lines.length === 0 ? (
                <EmptyState onClose={close} />
              ) : (
                <ul className="space-y-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="flex gap-4"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-clay">
                          <img
                            src={line.product.image}
                            alt={line.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-heading text-lg text-primary leading-tight">
                                {line.product.name}
                              </h3>
                              <p className="text-[11px] uppercase tracking-[0.18em] text-secondary mt-0.5">
                                {line.product.category}
                              </p>
                            </div>
                            <button
                              onClick={() => remove(line.product.id)}
                              aria-label={`Remove ${line.product.name}`}
                              className="text-secondary hover:text-destructive transition-colors duration-200 cursor-pointer p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper
                              qty={line.qty}
                              onDec={() => setQty(line.product.id, line.qty - 1)}
                              onInc={() => setQty(line.product.id, line.qty + 1)}
                            />
                            <div className="text-sm font-medium text-primary tabular-nums">
                              {formatPrice(line.qty * line.product.price)}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <footer className="border-t border-border/70 px-6 py-5 space-y-4">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row label="Shipping" value={<span className="text-secondary">Calculated at checkout</span>} />
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="font-heading text-xl text-primary">Total</span>
                  <motion.span
                    key={subtotal}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-heading text-2xl text-primary tabular-nums"
                  >
                    {formatPrice(subtotal)}
                  </motion.span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full inline-flex items-center justify-center rounded-full bg-primary text-on-primary py-3.5 text-sm font-medium tracking-wide hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Proceed to Checkout
                </button>
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-secondary">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  );
}

function QtyStepper({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background overflow-hidden">
      <button
        onClick={onDec}
        aria-label="Decrease quantity"
        className="p-2 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[2ch] text-center text-sm text-primary tabular-nums">
        {qty}
      </span>
      <button
        onClick={onInc}
        aria-label="Increase quantity"
        className="p-2 text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-16">
      <div className="h-16 w-16 rounded-full bg-clay flex items-center justify-center text-secondary mb-5">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h3 className="font-heading text-2xl text-primary">Your cart is empty</h3>
      <p className="text-sm text-secondary mt-2 max-w-[20rem]">
        Begin with a single piece — a quiet mug for morning, perhaps.
      </p>
      <button
        onClick={onClose}
        className="mt-6 rounded-full border border-primary text-primary px-6 py-2.5 text-sm hover:bg-primary hover:text-on-primary transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Browse the Collection
      </button>
    </div>
  );
}
