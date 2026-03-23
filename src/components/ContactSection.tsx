import { motion } from "framer-motion";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 md:py-40 bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Контакт
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-foreground mb-8">
              На связи
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mb-12">
              Запишитесь на удобное время или просто загляните — 
              мы всегда рады видеть вас.
            </p>

            <a
              href="tel:+79001234567"
              className="inline-block font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background px-8 py-4 hover:bg-accent hover:text-foreground transition-colors duration-300"
            >
              Записаться: +7 900 123-45-67
            </a>
          </motion.div>

          {/* Right - details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-10"
          >
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Адрес
              </p>
              <p className="font-display text-xl md:text-2xl font-light text-foreground">
                ул. Большая Никитская, 17
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Москва, 125009
              </p>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Часы работы
              </p>
              <div className="space-y-1">
                <div className="flex justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">Пн — Пт</span>
                  <span className="font-body text-sm text-muted-foreground">10:00 — 21:00</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">Сб — Вс</span>
                  <span className="font-body text-sm text-muted-foreground">11:00 — 20:00</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Соцсети
              </p>
              <div className="flex gap-6">
                <a href="#" className="font-body text-sm text-foreground hover:text-accent transition-colors duration-300">
                  Telegram
                </a>
                <a href="#" className="font-body text-sm text-foreground hover:text-accent transition-colors duration-300">
                  Instagram
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
