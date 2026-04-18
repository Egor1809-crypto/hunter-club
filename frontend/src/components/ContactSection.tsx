import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const contactLogoUrl = `/${encodeURIComponent("Хантер Лого.png")}`;
const mapsQuery = encodeURIComponent("Саратов, Сакко и Ванцетти, 14 корпус 1");
const openStreetMapEmbedUrl =
  "https://www.openstreetmap.org/export/embed.html?bbox=46.0175%2C51.5290%2C46.0255%2C51.5335&layer=mapnik&marker=51.5312%2C46.0215";
const openStreetMapUrl = `https://www.openstreetmap.org/search?query=${mapsQuery}`;

const ContactSection = () => {
  const { language } = useLanguage();
  const copy = {
    ru: {
      eyebrow: "Контакт",
      title: "Слава на связи. Будьте со Славой.",
      description: "Свяжитесь с нами в удобное для вас время или просто загляните — мы всегда рады видеть вас.",
      address: "Адрес",
      hours: "Часы работы",
      openMaps: "Открыть в картах",
    },
    en: {
      eyebrow: "Contact",
      title: "Get in touch",
      description: "Book a convenient time or just stop by. We are always glad to see you.",
      book: "Book now",
      address: "Address",
      hours: "Opening hours",
      openMaps: "Open in maps",
    },
  }[language];

  return (
    <section
      id="contact"
      className="section-golden bg-card scroll-mt-[4.5rem] md:scroll-mt-[5.25rem] lg:scroll-mt-[5.75rem]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 lg:mx-8">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-[34rem]"
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {copy.eyebrow}
            </p>
            <div className="mb-6 md:mb-8 flex items-start gap-5 md:gap-6">
              <span className="relative mt-1 shrink-0 h-28 w-28 md:h-40 md:w-40 rounded-full bg-white/90 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.08)] opacity-75">
                <img
                  src={contactLogoUrl}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover scale-[1.18]"
                  loading="lazy"
                />
              </span>
              <h2 className="font-display text-[1.7rem] md:text-[2.4rem] font-light leading-[1.04] text-foreground max-w-[10ch]">
                {copy.title}
              </h2>
            </div>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mb-7 md:mb-8">
              {copy.description}
            </p>

            <a
              href="tel:+79873245597"
              className="inline-block font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background px-8 py-4 hover:bg-accent hover:text-foreground transition-colors duration-300"
            >
              +7 987 324-55-97
            </a>
          </motion.div>

          {/* Right - details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10 max-w-[34rem]"
          >
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                {copy.address}
              </p>
              <p className="font-display text-xl md:text-2xl font-light text-foreground leading-snug pr-2">
                {language === "ru" ? "г. Саратов, Сакко и Ванцетти, 14 корпус 1" : "14 корпус 1 Sakko i Vanzetti, Saratov"}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {language === "ru" ? "Саратов" : "Saratov"}
              </p>
              <div className="mt-6 w-full max-w-md border border-border overflow-hidden bg-background">
                <iframe
                  title={language === "ru" ? "Карта барбершопа Hunter" : "Hunter barbershop map"}
                  src={openStreetMapEmbedUrl}
                  className="h-52 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={openStreetMapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 font-body text-xs tracking-[0.15em] uppercase text-foreground hover:text-accent transition-colors duration-300"
              >
                {copy.openMaps}
              </a>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                {copy.hours}
              </p>
              <div className="space-y-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">
                    {language === "ru" ? "Понедельник — Пятница" : "Monday — Friday"}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">10:00 — 21:00</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">
                    {language === "ru" ? "Суббота — Воскресенье" : "Saturday — Sunday"}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">11:00 — 20:00</span>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
