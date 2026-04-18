import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { BookingPanel } from "@/components/BookingSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Service = {
  id: string;
  slug?: string;
  name: string;
  description: string | null;
  price: string | number | null;
  duration_min: number;
  is_active: boolean;
};

const fallbackServices = {
  ru: [
    { id: "fallback-haircut", name: "Стрижка", price: "от 3 000 ₽", duration: "60 мин", description: "Точность, а не скорость." },
    { id: "fallback-shave", name: "Бритьё опасной бритвой", price: "от 2 500 ₽", duration: "45 мин", description: "Королевское бритьё с горячими полотенцами и маслами" },
    { id: "fallback-haircut-beard", name: "Стрижка + борода", price: "от 4 500 ₽", duration: "90 мин", description: "Комплексный уход: стрижка и моделирование бороды" },
    { id: "fallback-beard", name: "Моделирование бороды", price: "от 2 000 ₽", duration: "40 мин", description: "Придание формы и уход за бородой" },
    { id: "fallback-gray", name: "Камуфляж седины", price: "от 2 000 ₽", duration: "30 мин", description: "Естественная тонировка без резких переходов" },
  ],
  en: [
    { id: "fallback-haircut", name: "Haircut", price: "from 3,000 RUB", duration: "60 min", description: "Classic or modern haircut with a barber consultation" },
    { id: "fallback-shave", name: "Straight Razor Shave", price: "from 2,500 RUB", duration: "45 min", description: "A royal shave with hot towels and oils" },
    { id: "fallback-haircut-beard", name: "Haircut + Beard", price: "from 4,500 RUB", duration: "90 min", description: "Complete care: haircut and beard shaping" },
    { id: "fallback-beard", name: "Beard Shaping", price: "from 2,000 RUB", duration: "40 min", description: "Clean contouring and beard care" },
    { id: "fallback-gray", name: "Gray Blending", price: "from 2,000 RUB", duration: "30 min", description: "Natural tone correction without harsh transitions" },
  ],
};

const serviceDetails = {
  ru: {
    "Стрижка": [
      "Стрижка Hunter — это точность формы, которая подчёркивает характер, а не спорит с ним.",
      "Мы начинаем с короткой консультации, чтобы понять, какой образ будет работать в жизни, а не только в зеркале.",
      "Линии выстраиваются чисто, переходы — мягко, а итог выглядит дорого и уверенно.",
      "Это стрижка для тех, кто привык к безупречному результату без лишних слов.",
      "Вышел — и сразу готов на встречу, в город и на свою охоту.",
    ],
    "Бритьё опасной бритвой": [
      "Бритьё опасной бритвой — это классический ритуал в премиальном исполнении.",
      "Горячее полотенце, подготовка кожи и уверенное движение бритвы превращают процедуру в чистое удовольствие.",
      "Мы работаем максимально деликатно, чтобы кожа осталась гладкой, свежей и спокойной.",
      "Такое бритьё даёт не только безупречный результат, но и особое чувство собранности.",
      "Это выбор для тех, кто ценит традицию, точность и настоящий мужской сервис.",
    ],
    "Стрижка + борода": [
      "Стрижка + борода — это цельный образ, собранный в одной процедуре.",
      "Мы связываем форму волос и линию бороды так, чтобы всё выглядело гармонично и дорого.",
      "Сначала задаём архитектуру стрижки, затем доводим бороду до безупречного баланса.",
      "В результате вы получаете не две услуги, а один сильный образ без случайных деталей.",
      "Именно так выглядит готовность к любому выходу — уверенно, чисто и по делу.",
    ],
    "Борода": [
      "Борода Hunter — это не просто форма, а точный мужской акцент.",
      "Мы выстраиваем контур, плотность и баланс, чтобы борода усиливала черты лица.",
      "Каждый штрих работает на чистый силуэт, ухоженный вид и ощущение статуса.",
      "В уходе важны комфорт, аккуратность и стойкий результат, который держит форму дольше.",
      "Это тот самый финальный штрих, после которого образ звучит глубже.",
    ],
    "Моделирование бороды": [
      "Борода Hunter — это не просто форма, а точный мужской акцент.",
      "Мы выстраиваем контур, плотность и баланс, чтобы борода усиливала черты лица.",
      "Каждый штрих работает на чистый силуэт, ухоженный вид и ощущение статуса.",
      "В уходе важны комфорт, аккуратность и стойкий результат, который держит форму дольше.",
      "Это тот самый финальный штрих, после которого образ звучит глубже.",
    ],
    "Охота на рассвете": [
      "Охота на рассвете — фирменный ритуал Hunter для тех, кто начинает день раньше других.",
      "Это не просто услуга, а атмосферный старт, который собирает мысли и настраивает на результат.",
      "Свежесть, точность и ощущение внутреннего азарта делают образ особенно энергичным.",
      "Такой формат выбирают мужчины, для которых утро — это время силы, а не спешки.",
      "На охоту с охотой — и с видом, который уже говорит за вас.",
    ],
    "Камуфляж седины": [
      "Естественное выравнивание тона без резких переходов.",
      "Без маскировки — только спокойная, уверенная чистота образа.",
    ],
  },
  en: {
    Haircut: [
      "A precise cut refined down to the millimeter.",
      "No rush, only control, structure and a shape that holds its line.",
    ],
    "Straight Razor Shave": [
      "A ritual without unnecessary movement.",
      "Hot towel, steel and complete focus on every line.",
    ],
    "Haircut + Beard": [
      "A complete form-building session.",
      "Hair and beard are brought into one system, with no accidents and no compromises.",
    ],
    "Beard Shaping": [
      "A clear outline and disciplined form.",
      "We remove the excess and leave only structure and character.",
    ],
    "Gray Blending": [
      "Natural tone balancing without harsh transitions.",
      "No masking, only a calm and confident clarity of appearance.",
    ],
  },
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
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const copy = {
    ru: {
      eyebrow: "Что мы делаем",
      title: "Услуги",
      loading: "Загружаем актуальные услуги...",
      chooseService: "Выберите услугу",
      findTime: "Найти время",
      loadingServices: "Загружаем услуги...",
      fallbackServices: "Показываем базовый список услуг",
      panelTitle: "Начать охоту",
      panelDescription: "Выберите услугу в модуле услуг, затем откройте полную панель даты и времени.",
      findTimeAction: "НАЙТИ ВРЕМЯ →",
    },
    en: {
      eyebrow: "What we do",
      title: "Services",
      loading: "Loading current services...",
      chooseService: "Choose a service",
      findTime: "Find time",
      loadingServices: "Loading services...",
      fallbackServices: "Showing the default services list",
      panelTitle: "Online booking",
      panelDescription: "Choose a service in the services section, then open the full date and time panel.",
      findTimeAction: "FIND TIME →",
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
        id: service.id,
        name:
          language === "ru" && (service.slug === "shave" || service.name === "Бритьё опасной")
            ? "Бритьё опасной бритвой"
            : service.name,
        price: formatPrice(service.price, language),
        duration: `${service.duration_min} ${language === "ru" ? "мин" : "min"}`,
        description:
          language === "ru" &&
          service.slug === "haircut" &&
          service.description?.includes("Мужская стрижка")
            ? "Точность, а не скорость."
            : service.description ?? "",
      }))
    : fallbackServices[language];

  const servicesWithDetails = services.map((service) => ({
    ...service,
    details:
      serviceDetails[language][service.name as keyof (typeof serviceDetails)[typeof language]] ?? [service.description],
  }));

  return (
    <section
      id="services"
      className="section-golden-tight bg-card scroll-mt-[4.5rem] md:scroll-mt-[5.25rem] lg:scroll-mt-[5.75rem]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:mx-8"
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

        <Accordion type="single" collapsible className="lg:mx-8 border-t border-border">
          {servicesWithDetails.map((service, i) => (
            <motion.div
              key={`${service.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <AccordionItem value={`service-${i}`} className="border-b border-border">
                <AccordionTrigger className="group py-7 md:py-10 hover:no-underline">
                  <div className="grid w-full grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-start text-left">
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
                    <div className="md:col-span-2 md:text-right pt-1 md:pt-0">
                      <span className="font-body text-sm tracking-wide text-foreground">
                        {service.price}
                      </span>
                    </div>
                    <div className="md:col-span-1 md:text-right pr-3">
                      <span className="font-body text-xs text-muted-foreground">
                        {service.duration}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 md:pb-10">
                  <div className="grid grid-cols-1">
                    <div className="border border-border/35 bg-background/30 px-5 py-5 md:px-6 md:py-6">
                      {service.details.map((line, detailIndex) => (
                        <div key={`${service.name}-detail-${detailIndex}`}>
                          <p
                            className={`${
                              detailIndex === 0
                                ? "font-display text-[1.35rem] md:text-[1.6rem] leading-[1.25] text-foreground"
                                : "font-display text-[1.05rem] md:text-[1.2rem] leading-[1.45] text-foreground/78"
                            }`}
                          >
                            {line}
                          </p>
                          {detailIndex < service.details.length - 1 && (
                            <div className="mt-4 h-px w-full bg-border/35" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div
          id="services-booking"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="lg:mx-8 mt-16 md:mt-20 scroll-mt-[4.5rem] md:scroll-mt-[5.25rem] lg:scroll-mt-[5.75rem]"
        >
          <div className="mx-auto w-full max-w-[54rem] border border-white/20 bg-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl px-6 py-8 md:px-8 md:py-10">
            <div className="space-y-5">
              <div className="mx-auto max-w-[48rem]">
                <p className="font-display text-3xl md:text-4xl font-light text-foreground">{copy.panelTitle}</p>
              </div>
              <div className="mx-auto grid max-w-[48rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {services.map((service) => {
                  const isSelected = selectedServiceId === service.id;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedServiceId(service.id)}
                      className={cn(
                        "h-[5.5rem] w-full border px-5 py-4 text-center transition-all duration-300",
                        "flex items-center justify-center bg-background",
                        isSelected
                          ? "border-foreground bg-foreground text-background shadow-[0_12px_30px_rgba(255,255,255,0.08)]"
                          : "border-border/70 text-foreground hover:border-foreground/65 hover:bg-background/90",
                      )}
                    >
                      <span className="font-body text-xs uppercase tracking-[0.15em]">
                        {service.name}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsBookingOpen(true)}
                  disabled={!selectedServiceId}
                  className={cn(
                    "h-[5.5rem] w-full border px-5 py-4 text-center font-body text-xs uppercase tracking-[0.15em] transition-all duration-300",
                    "flex items-center justify-center",
                    selectedServiceId
                      ? "border-foreground bg-foreground text-background shadow-[0_12px_30px_rgba(255,255,255,0.08)] hover:bg-accent hover:text-foreground"
                      : "border-foreground/80 bg-foreground text-background/55 cursor-not-allowed",
                  )}
                >
                  {copy.findTimeAction}
                </button>
              </div>

              {!services.length ? (
                <p className="text-center font-body text-sm text-muted-foreground">{copy.fallbackServices}</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>

      <Sheet open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-border bg-background text-foreground sm:max-w-4xl">
          <SheetHeader className="mb-8">
            <SheetTitle className="font-display text-3xl md:text-4xl font-light">
              {copy.panelTitle}
            </SheetTitle>
            <SheetDescription className="font-body text-sm text-muted-foreground">
              {copy.panelDescription}
            </SheetDescription>
          </SheetHeader>
          <BookingPanel initialServiceId={selectedServiceId} />
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default ServicesSection;
