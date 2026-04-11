import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";

const cosmeticsItems = [
  {
    name: "Matte Clay",
    type: "Укладка",
    description: "Матовая глина для текстуры, контроля и плотной фиксации без тяжёлого блеска.",
  },
  {
    name: "Beard Oil",
    type: "Борода",
    description: "Масло для мягкости бороды и аккуратного ежедневного ухода за кожей.",
  },
  {
    name: "Sea Salt Spray",
    type: "Текстура",
    description: "Солевой спрей для лёгкого объёма и живой формы после укладки.",
  },
];

const HunterNav = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navLogoUrl = `/${encodeURIComponent("Хантер Лого.png")}`;
  const navItems = {
    ru: [
      { label: "Услуги", href: "#services" },
      { label: "Отзывы", href: "#reviews" },
      { label: "О нас", href: "#about" },
      { label: "Контакт", href: "#contact" },
    ],
    en: [
      { label: "Services", href: "#services" },
      { label: "Reviews", href: "#reviews" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
  }[language];
  const copy = {
    ru: {
      book: "Записаться",
      navigation: "Навигация",
      cosmetics: "Косметика",
      cosmeticsDesc: "Средства для укладки, бороды и домашнего ухода",
      cosmeticsDialogTitle: "Косметика",
      cosmeticsDialogDesc: "Подборка средств, которые поддерживают результат стрижки и ухода дома.",
      menu: "Меню",
    },
    en: {
      book: "Book now",
      navigation: "Navigation",
      cosmetics: "Cosmetics",
      cosmeticsDesc: "Products for styling, beard care and home grooming",
      cosmeticsDialogTitle: "Cosmetics",
      cosmeticsDialogDesc: "A curated set of products that help maintain your cut and grooming at home.",
      menu: "Menu",
    },
  }[language];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[96rem] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-3">
        <a
          href="#"
          className="min-w-0 flex items-center gap-2.5 font-display text-xl sm:text-2xl md:text-3xl font-light tracking-[0.18em] text-foreground uppercase"
        >
          <span className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 overflow-hidden shadow-[0_0_24px_rgba(255,255,255,0.12)] opacity-70 pointer-events-none select-none shrink-0 block">
            <img
              src={navLogoUrl}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover scale-[1.18]"
              loading="lazy"
            />
          </span>
          <span className="truncate">Hunter</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12 ml-auto mr-3">
          {navItems.map((item, index) => (
            <div key={item.href} className="flex items-center gap-12">
              <a
                href={item.href}
                className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </a>
              {index < navItems.length - 1 && (
                <span className="h-4 w-px bg-border" aria-hidden="true" />
              )}
            </div>
          ))}
          <a
            href="#contact"
            className="font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background px-6 py-2.5 hover:bg-accent hover:text-foreground transition-colors duration-300"
          >
            {copy.book}
          </a>
        </div>

        {/* Burger menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-col gap-1.5 p-2"
          aria-label={copy.menu}
        >
          <span className={`block w-6 h-px bg-foreground transition-transform duration-300 ${isOpen ? "rotate-45 translate-y-[3.5px]" : ""}`} />
          <span className={`block w-6 h-px bg-foreground transition-opacity duration-300 ${isOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-px bg-foreground transition-transform duration-300 ${isOpen ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
        </button>
        </div>
      </div>

      {/* Burger menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="border-b border-border bg-background/95 backdrop-blur-md"
          >
            <div className="max-w-[96rem] mx-auto px-5 md:px-10 py-6 md:py-10">
              <div className="flex flex-col gap-5">
                <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground">
                  {copy.navigation}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="border border-border px-5 py-4 font-display text-2xl md:text-3xl font-light text-foreground hover:bg-card transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  ))}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-left border border-border px-5 py-4 font-display text-2xl md:text-3xl font-light text-foreground hover:bg-card transition-colors duration-300">
                        {copy.cosmetics}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl border-border bg-background text-foreground">
                      <DialogHeader>
                        <DialogTitle className="font-display text-3xl font-light">{copy.cosmeticsDialogTitle}</DialogTitle>
                        <DialogDescription className="font-body text-sm text-muted-foreground">
                          {copy.cosmeticsDialogDesc}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {cosmeticsItems.map((item) => (
                          <div key={item.name} className="border border-border bg-card/60 p-5">
                            <p className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                              {item.type}
                            </p>
                            <p className="font-display text-2xl font-light text-foreground mb-3">
                              {item.name}
                            </p>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <a
                    href="#contact"
                    onClick={() => setIsOpen(false)}
                    className="border border-foreground bg-foreground text-background px-5 py-4 font-display text-2xl md:text-3xl font-light hover:bg-accent hover:text-foreground transition-colors duration-300"
                  >
                    {copy.book}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default HunterNav;
