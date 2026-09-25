import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { BrandMark } from "./BrandMark";

const NAV_LINKS = [
  { label: "Shop", section: "catalog" },
  { label: "Mugs", section: "catalog" },
  { label: "Plates", section: "catalog" },
  { label: "Our Story", section: "story" },
] as const;

export function Header() {
  const { open, itemCount } = useCart();
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  // On home page we scroll to in-page sections; elsewhere we route home then scroll.
  const sectionHref = (section: string) => (onHome ? `#${section}` : `/#${section}`);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  // Close on Escape; return focus to the toggle when the menu closes
  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/75 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
        <BrandMark size="md" />

        <nav className="hidden md:flex items-center gap-8 text-sm text-secondary" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={sectionHref(l.section)}
              className="hover:text-foreground transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile menu toggle (hidden on md+) */}
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-border bg-background/60 text-primary hover:bg-muted transition-colors duration-200 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={open}
            className="relative inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 min-h-11 text-sm text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-200 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      </div>

      {/* Mobile navigation — rendered in a portal so the header's backdrop-filter
          (which creates a containing block for fixed descendants) can't trap it. */}
      {createPortal(
        <AnimatePresence>
          {menuOpen && (
            <div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="fixed inset-0 z-40 md:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeMenu}
                className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
              />

              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 36 }}
                className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-background shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between pl-6 pr-6 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-4 border-b border-border/70">
                  <BrandMark size="sm" />
                  <button
                    ref={closeButtonRef}
                    onClick={closeMenu}
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center h-11 w-11 rounded-full text-secondary hover:text-primary hover:bg-muted transition-colors duration-200 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto scroll-elegant px-6 py-4" aria-label="Mobile">
                  <ul className="space-y-1">
                    {NAV_LINKS.map((l) => (
                      <li key={l.label}>
                        <a
                          href={sectionHref(l.section)}
                          onClick={closeMenu}
                          className="flex items-center rounded-xl px-4 py-3.5 text-base text-primary hover:bg-muted transition-colors duration-200 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="border-t border-border/70 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
                  <button
                    onClick={() => {
                      closeMenu();
                      open();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary px-6 py-3.5 text-sm font-medium tracking-wide hover:bg-accent transition-colors duration-300 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    View Cart
                    {itemCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-on-primary/20 text-on-primary text-xs font-semibold">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
