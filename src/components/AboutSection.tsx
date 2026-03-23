import { motion } from "framer-motion";
import aboutImage from "@/assets/about-barber.jpg";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="aspect-[3/4] overflow-hidden"
          >
            <img
              src={aboutImage}
              alt="Мастер за работой"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              loading="lazy"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              О нас
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-8 leading-tight">
              Мастерство,
              <br />
              <span className="italic">проверенное временем</span>
            </h2>
            <div className="space-y-5">
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                Hunter — это пространство, где традиции мужского ремесла 
                встречаются с безупречным вкусом. Мы не гонимся за трендами — 
                мы задаём стандарт.
              </p>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                Каждый визит — это ритуал. Приватная атмосфера, внимание к 
                деталям и результат, который говорит сам за себя. Здесь ценят 
                ваше время и уважают ваш стиль.
              </p>
            </div>
            <div className="h-px bg-border w-16 my-10" />
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="font-display text-3xl md:text-4xl font-light text-foreground">7+</p>
                <p className="font-body text-xs text-muted-foreground mt-1 tracking-wide uppercase">Лет опыта</p>
              </div>
              <div>
                <p className="font-display text-3xl md:text-4xl font-light text-foreground">4</p>
                <p className="font-body text-xs text-muted-foreground mt-1 tracking-wide uppercase">Мастера</p>
              </div>
              <div>
                <p className="font-display text-3xl md:text-4xl font-light text-foreground">5K+</p>
                <p className="font-body text-xs text-muted-foreground mt-1 tracking-wide uppercase">Клиентов</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
