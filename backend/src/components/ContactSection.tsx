import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const ContactSection = () => {
  const { language } = useLanguage();
  const copy = {
    ru: {
      eyebrow: "Контакт",
      title: "Слава на связи. Будьте со Славой.",
      description: "Запишитесь на удобное время или просто загляните — мы всегда рады видеть вас.",
      book: "Записаться",
      address: "Адрес",
      hours: "Часы работы",
      socials: "Соцсети",
      openMaps: "Открыть в картах",
      backToTop: "Наверх",
    },
    en: {
      eyebrow: "Contact",
      title: "Get in touch",
      description: "Book a convenient time or just stop by. We are always glad to see you.",
      book: "Book now",
      address: "Address",
      hours: "Opening hours",
      socials: "Socials",
      openMaps: "Open in maps",
      backToTop: "Back to top",
    },
  }[language];

  return (
    <section id="contact" className="section-golden bg-card">
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
              {copy.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-foreground mb-[34px] md:mb-[55px]">
              {copy.title}
            </h2>
            <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-md mb-12">
              {copy.description}
            </p>

            <a
              href="tel:+79873245597"
              className="inline-block font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background px-8 py-4 hover:bg-accent hover:text-foreground transition-colors duration-300"
            >
              {copy.book}: +7 987 324-55-97
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
                {copy.address}
              </p>
              <p className="font-display text-xl md:text-2xl font-light text-foreground">
                {language === "ru" ? "г. Саратов, Сакко и Ванцетти, 14 корпус 1" : "14 корпус 1 Sakko i Vanzetti, Saratov"}
              </p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                {language === "ru" ? "Саратов" : "Saratov"}
              </p>
              <div className="mt-6 max-w-md border border-border overflow-hidden bg-background">
                <iframe
                  title={language === "ru" ? "Карта барбершопа Hunter" : "Hunter barbershop map"}
                  src="https://www.google.com/maps?q=%D0%A1%D0%B0%D1%80%D0%B0%D1%82%D0%BE%D0%B2%2C%20%D0%A1%D0%B0%D0%BA%D0%BA%D0%BE%20%D0%B8%20%D0%92%D0%B0%D0%BD%D1%86%D0%B5%D1%82%D1%82%D0%B8%2C%2014%20%D0%BA%D0%BE%D1%80%D0%BF%D1%83%D1%81%201&z=16&output=embed"
                  className="h-52 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=%D0%A1%D0%B0%D1%80%D0%B0%D1%82%D0%BE%D0%B2%2C%20%D0%A1%D0%B0%D0%BA%D0%BA%D0%BE%20%D0%B8%20%D0%92%D0%B0%D0%BD%D1%86%D0%B5%D1%82%D1%82%D0%B8%2C%2014%20%D0%BA%D0%BE%D1%80%D0%BF%D1%83%D1%81%201"
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
                <div className="flex justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">
                    {language === "ru" ? "Понедельник — Пятница" : "Monday — Friday"}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">10:00 — 21:00</span>
                </div>
                <div className="flex justify-between max-w-xs">
                  <span className="font-body text-sm text-foreground">
                    {language === "ru" ? "Суббота — Воскресенье" : "Saturday — Sunday"}
                  </span>
                  <span className="font-body text-sm text-muted-foreground">11:00 — 20:00</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                {copy.socials}
              </p>
              <ul className="contact-socials">
                <li className="icon-content">
                  <span className="tooltip">Telegram</span>
                  <a
                    href="https://t.me/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                    data-social="telegram"
                  >
                    <div className="filled" />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M21.685 2.318a1.13 1.13 0 0 0-1.165-.158L2.91 9.08c-.55.214-.52 1.003.046 1.173l4.534 1.365 1.73 5.38a.87.87 0 0 0 1.502.29l2.529-2.596 4.959 3.641a1.13 1.13 0 0 0 1.781-.668L21.984 3.37a1.13 1.13 0 0 0-.299-1.053ZM9.82 11.102l8.852-5.435-7.298 6.784a.87.87 0 0 0-.252.447l-.488 2.925-1.115-3.47a.87.87 0 0 0-.599-.572Z"
                      />
                    </svg>
                  </a>
                </li>
                <li className="icon-content">
                  <span className="tooltip">Instagram</span>
                  <a
                    href="https://instagram.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    data-social="instagram"
                  >
                    <div className="filled" />
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.75 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <a
            href="#"
            aria-label={copy.backToTop}
            className="group flex h-14 w-14 items-center justify-center border border-border bg-background text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background"
          >
            <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
