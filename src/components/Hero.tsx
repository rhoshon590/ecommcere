import { motion } from "framer-motion";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-28 pb-16 md:pb-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="uppercase tracking-[0.35em] text-xs text-secondary mb-6"
        >
          AuraShop · Stoneware Studio
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] text-primary"
        >
          Vessels for the
          <br />
          <span className="italic text-accent">quiet rituals</span> of home.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-xl mx-auto text-base md:text-lg text-secondary leading-relaxed"
        >
          A small studio collection of hand-thrown mugs and plates, finished in
          glazes the color of weathered stone, soft linen, and warm clay.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-10"
        >
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-on-primary px-8 py-3.5 text-sm font-medium tracking-wide hover:bg-accent transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Explore the Collection
          </a>
        </motion.div>
      </div>
    </section>
  );
}
