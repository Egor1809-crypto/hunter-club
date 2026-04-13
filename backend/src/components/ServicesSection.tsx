import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string | number | null;
  duration_min: number;
  is_active: boolean;
};

const fallbackServices = {
  ru: [
    { name: "Стрижка", price: "от 3 000 ₽", duration: "60 мин", description: "Точность, а не скорость." },
    { name: "Бритьё опасной бритвой", price: "от 2 500 ₽", duration: "45 мин", description: "Королевское бритьё с горячими полотенцами и маслами" },
    { name: "Стрижка + борода", price: "от 4 500 ₽", duration: "90 мин", description: "Комплексный уход: стрижка и моделирование бороды" },
    { name: "Моделирование бороды", price: "от 2 000 ₽", duration: "40 мин", description: "Придание формы и уход за бородой" },
    { name: "Камуфляж седины", price: "от 2 000 ₽", duration: "30 мин", description: "Естественная тонировка без резких переходов" },
  ],
  en: [
    { name: "Haircut", price: "from 3,000 RUB", duration: "60 min", description: "Classic or modern haircut with a barber consultation" },
    { name: "Straight Razor Shave", price: "from 2,500 RUB", duration: "45 min", description: "A royal shave with hot towels and oils" },
    { name: "Haircut + Beard", price: "from 4,500 RUB", duration: "90 min", description: "Complete care: haircut and beard shaping" },
    { name: "Beard Shaping", price: "from 2,000 RUB", duration: "40 min", description: "Clean contouring and beard care" },
    { name: "Gray Blending", price: "from 2,000 RUB", duration: "30 min", description: "Natural tone correction without harsh transitions" },
  ],
};

const formatPrice = (value: string | number | null, language: "ru" | "en") => {
  if (value === null || value === undefined) {
    return language === "ru" ? "По запросу" : "On request";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const ServicesSection = () => {
  const { language } = useLanguage();
  const copy = {
    ru: {
      eyebrow: "Что мы делаем",
      title: "Услуги",
      loading: "Загружаем актуальные услуги...",
    },
    en: {
      eyebrow: "What we do",
      title: "Services",
      loading: "Loading current services...",
    },
  }[language];

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to fetch services");
      }

      return (result.data as Service[]).filter((service) => service.is_active);
    },
  });

  const services = servicesQuery.data?.length
    ? servicesQuery.data.map((service) => ({
        name: service.name,
        price: formatPrice(service.price, language),
        duration: `${service.duration_min} ${language === "ru" ? "мин" : "min"}`,
        description: service.description ?? "",
      }))
    : fallbackServices[language];

  return (
    <section id="services" className="section-golden-tight bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            {copy.eyebrow}
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-foreground golden-stack">
            {copy.title}
          </h2>
          {servicesQuery.isLoading ? (
            <p className="font-body text-sm text-muted-foreground -mt-6 golden-stack">
              {copy.loading}
            </p>
          ) : null}
        </motion.div>

        <div className="space-y-0">
          {services.map((service, i) => (
            <motion.div
              key={`${service.name}-${i}`}
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
