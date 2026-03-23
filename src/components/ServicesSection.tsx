import { motion } from "framer-motion";

const services = [
  { name: "Стрижка", price: "от 3 000 ₽", duration: "60 мин", description: "Классическая или современная стрижка с консультацией мастера" },
  { name: "Бритьё опасной бритвой", price: "от 2 500 ₽", duration: "45 мин", description: "Королевское бритьё с горячими полотенцами и маслами" },
  { name: "Стрижка + борода", price: "от 4 500 ₽", duration: "90 мин", description: "Комплексный уход: стрижка и моделирование бороды" },
  { name: "Моделирование бороды", price: "от 2 000 ₽", duration: "40 мин", description: "Придание формы и уход за бородой" },
  { name: "Камуфляж седины", price: "от 2 000 ₽", duration: "30 мин", description: "Естественная тонировка без резких переходов" },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 md:py-40 bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            Что мы делаем
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-foreground mb-16 md:mb-24">
            Услуги
          </h2>
        </motion.div>

        <div className="space-y-0">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group border-t border-border py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start cursor-default"
            >
              <div className="md:col-span-5">
                <h3 className="font-display text-2xl md:text-3xl font-light text-foreground group-hover:text-accent transition-colors duration-300">
                  {service.name}
                </h3>
              </div>
              <div className="md:col-span-4">
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="md:col-span-2 text-right">
                <span className="font-body text-sm tracking-wide text-foreground">
                  {service.price}
                </span>
              </div>
              <div className="md:col-span-1 text-right">
                <span className="font-body text-xs text-muted-foreground">
                  {service.duration}
                </span>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
