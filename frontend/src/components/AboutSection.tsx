import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import aboutSlavaCropped from "@/assets/about-slava-cropped.png";

const AboutSection = () => {
  const { language } = useLanguage();
  const copy = {
    ru: {
      eyebrow: "О нас",
      titleMain: "Мастерство,",
      titleAccent: "проверенное временем",
      short:
        "Слава, который стрижёт на славу. Барбер с математическим фокусом на точность линий и абсолютную чистоту переходов. От строгой классики до современных стилей — всегда безупречная форма.",
      p1: "Hunter — это пространство, где традиции мужского ремесла встречаются с безупречным вкусом. Мы не гонимся за трендами — мы задаём стандарт.",
      p2: "Каждый визит — это ритуал. Приватная атмосфера, внимание к деталям и результат, который говорит сам за себя. Здесь ценят ваше время и уважают ваш стиль.",
    },
    en: {
      eyebrow: "About us",
      titleMain: "Craft,",
      titleAccent: "proven by time",
      short:
        "Slava cuts with pride. A barber with a mathematical focus on line precision and absolutely clean fades. From strict classics to modern styles, the form is always impeccable.",
      p1: "Hunter is a place where the traditions of men's grooming meet impeccable taste. We do not chase trends, we set the standard.",
      p2: "Every visit is a ritual. A private atmosphere, attention to detail and a result that speaks for itself. Your time is valued here, and your style is respected.",
    },
  }[language];

  return (
    <section id="about" className="section-golden section-grid bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 items-center lg:mx-8">
          {/* Left — barber photo + short description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-[34rem]"
          >
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="aspect-[3/4] flex items-center justify-center border border-border overflow-hidden">
                <img
                  src={aboutSlavaCropped}
                  alt={language === "ru" ? "Фото Славы" : "Photo of Slava"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="space-y-3">
                <p className="font-display text-3xl md:text-4xl font-light text-foreground">Слава</p>
                <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                  {copy.short}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-[34rem]"
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {copy.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-[34px] md:mb-[55px] leading-tight max-w-[11ch]">
              {copy.titleMain}
              <br />
              <span className="italic">{copy.titleAccent}</span>
            </h2>
            <div className="space-y-5">
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                {copy.p1}
              </p>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                {copy.p2}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
