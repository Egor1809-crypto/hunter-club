import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Pure black background — no image */}
      <div className="absolute inset-0 bg-background" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        >
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
            Премиальный барбершоп
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] text-foreground mb-8">
            Стрижём
            <br />
            <span className="italic">на Славу</span>
          </h1>
          <div className="h-px bg-foreground/20 w-24 mb-8 animate-line-expand" />
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-md leading-relaxed">
            Hunter — стрижки для тех, кто привык к лучшему.
            <br />
            На охоту с охотой.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <div className="w-px h-12 bg-foreground/30" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
