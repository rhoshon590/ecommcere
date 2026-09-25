import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { CartProvider, useCart } from "./cart/CartContext";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Catalog } from "./components/Catalog";
import { CartDrawer } from "./components/CartDrawer";
import { Checkout } from "./components/Checkout";
import { ProductPage } from "./components/ProductPage";
import { BrandMark } from "./components/BrandMark";

function Shell() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { close } = useCart();
  const location = useLocation();

  // Scroll to top on route change (and honor #section hashes when present)
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);

  const openCheckout = () => {
    close();
    window.setTimeout(() => setCheckoutOpen(true), 200);
  };

  return (
    <div className="min-h-screen bg-stoneware">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer onCheckout={openCheckout} />
      <Checkout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <Catalog />
      <Story />
    </>
  );
}

function NotFound() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-32 text-center">
      <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-4">
        404
      </p>
      <h1 className="font-heading text-4xl text-primary">
        This page is still on the wheel.
      </h1>
      <p className="mt-4 text-secondary">
        The piece you’re looking for hasn’t made it out of the kiln. Return to the
        collection to keep browsing.
      </p>
      <a
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-medium hover:bg-accent transition-colors duration-300 cursor-pointer"
      >
        Back to the Collection
      </a>
    </section>
  );
}

function Story() {
  return (
    <section
      id="story"
      className="max-w-3xl mx-auto px-6 md:px-10 py-20 md:py-28 text-center"
    >
      <p className="uppercase tracking-[0.3em] text-[10px] text-secondary mb-4">
        Our Studio
      </p>
      <h2 className="font-heading text-4xl md:text-5xl text-primary leading-tight">
        Made slowly, one piece at a time.
      </h2>
      <p className="mt-6 text-secondary leading-relaxed">
        Every AuraShop vessel is hand-thrown on the wheel in our small studio,
        bisque-fired, glazed by hand, and fired again. Small variations in color
        and form are the signature of human hands — no two pieces are quite
        alike.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/40">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        <div>
          <BrandMark size="md" />
          <p className="mt-5 text-sm text-secondary leading-relaxed max-w-xs">
            A small stoneware studio making hand-thrown vessels for the quiet
            rituals of home.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-secondary mb-4">
            Shop
          </p>
          <ul className="space-y-2 text-sm text-primary">
            <li><a href="/#catalog" className="hover:text-accent transition-colors duration-200 cursor-pointer">All Pieces</a></li>
            <li><a href="/#catalog" className="hover:text-accent transition-colors duration-200 cursor-pointer">Mugs</a></li>
            <li><a href="/#catalog" className="hover:text-accent transition-colors duration-200 cursor-pointer">Plates</a></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-secondary mb-4">
            Studio
          </p>
          <ul className="space-y-2 text-sm text-primary">
            <li><a href="/#story" className="hover:text-accent transition-colors duration-200 cursor-pointer">Our Story</a></li>
            <li><a href="mailto:hello@aurashop.studio" className="hover:text-accent transition-colors duration-200 cursor-pointer">hello@aurashop.studio</a></li>
            <li className="text-secondary">Portland, Oregon</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-secondary tracking-wide">
          <p>© {new Date().getFullYear()} AuraShop Studio · Handmade stoneware</p>
          <p>Est. 2018 · Portland, OR</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>
  );
}
