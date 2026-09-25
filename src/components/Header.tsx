import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { BrandMark } from "./BrandMark";

export function Header() {
  const { open, itemCount } = useCart();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // On home page we scroll to in-page sections; elsewhere we route home then scroll.
  const sectionHref = (section: string) => (onHome ? `#${section}` : `/#${section}`);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <BrandMark size="md" />

        <nav className="hidden md:flex items-center gap-8 text-sm text-secondary">
          <a href={sectionHref("catalog")} className="hover:text-foreground transition-colors duration-200 cursor-pointer">Shop</a>
          <a href={sectionHref("catalog")} className="hover:text-foreground transition-colors duration-200 cursor-pointer">Mugs</a>
          <a href={sectionHref("catalog")} className="hover:text-foreground transition-colors duration-200 cursor-pointer">Plates</a>
          <a href={sectionHref("story")} className="hover:text-foreground transition-colors duration-200 cursor-pointer">Our Story</a>
        </nav>

        <button
          onClick={open}
          className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {itemCount > 0 && (
            <motion.span
              key={itemCount}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 24 }}
              className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent text-on-primary text-xs font-semibold"
            >
              {itemCount}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}
