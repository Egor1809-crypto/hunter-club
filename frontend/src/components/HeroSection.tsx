import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { BookingPanel } from "@/components/BookingSection";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const heroLogoUrl = `/${encodeURIComponent("Хантер Лого.png")}`;

type ServiceOption = {
  id: string;
  name: string;
  is_active: boolean;
};

const HeroSection = () => {
  const { language } = useLanguage();
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);

  const copy = {
    ru: {
      eyebrow: "Премиальный барбершоп",
      titleMain: "Слава стрижёт",
      titleAccent: "на славу",
      description: "Hunter — стрижки для тех, кто привык к лучшему.",
      tagline: "На охоту с охотой.",
      chooseService: "Выберите услугу",
      findTime: "Найти время",
      loadingServices: "Загружаем услуги...",
      manifestoLink: "Читать манифест →",
      manifestoTitle: "Философия Hunter",
      manifestoDescription: "Территория тишины, ясности и холодного фокуса посреди плотных городских джунглей.",
      manifestoParagraphs: [
        "Современный мир — это джунгли высокой плотности. Законы изменились, но инстинкты остались прежними. Сегодня мы не выслеживаем добычу в тайге. Мы ведем сложные переговоры, строим архитектуру бизнеса, выигрываем суды и принимаем решения, от которых зависят судьбы компаний. Каждый день — это охота.",
        "Успех охотника зависит не от количества суетливых движений, а от его выдержки, холодного расчета и абсолютной концентрации. Но чтобы сохранять эту остроту, хищнику нужна территория тишины. Базовый лагерь, где можно снять броню, отсечь информационный шум и перезарядиться.",
        "Барбершоп Hunter создавался именно как такое пространство. Мы не просто стрижем. Мы возвращаем ясность.",
        "Мы верим в непреложный закон формы и содержания: небрежность порождает хаос. И наоборот — безупречный, выверенный до миллиметра срез становится точкой опоры. Ритуал ухода за собой — это процесс отсечения лишнего.",
        "Порядок на голове — это фундамент порядка в голове.",
        "Когда мастер выключает машинку и вы смотрите в зеркало, вы видите не просто идеальный контур. Вы чувствуете структуру. Хаос уступает место системе. Ум становится холодным, а фокус — бритвенно-острым.",
        "Вы снова готовы к охоте.",
      ],
      panelTitle: "Онлайн-запись",
      panelDescription: "Сначала выберите услугу на главном экране, затем откройте полную панель даты и времени.",
    },
    en: {
      eyebrow: "Premium barbershop",
      titleMain: "Slava cuts",
      titleAccent: "with pride",
      description: "Hunter is grooming for those who expect the best.",
      tagline: "Step into the hunt with confidence.",
      chooseService: "Choose a service",
      findTime: "Find time",
      loadingServices: "Loading services...",
      manifestoLink: "Read the manifesto →",
      manifestoTitle: "Hunter philosophy",
      manifestoDescription: "A quiet territory for clarity and cold focus in the middle of dense urban jungle.",
      manifestoParagraphs: [
        "The modern world is a jungle of high density. The laws have changed, but the instincts remain the same. Today we do not track prey in the taiga. We negotiate, build business architecture, win cases and make decisions that shape the fate of companies. Every day is a hunt.",
        "A hunter succeeds not through frantic movement, but through restraint, cold calculation and absolute concentration. To keep that edge, a predator needs a quiet territory. A base camp where armor comes off, noise is cut away and focus is restored.",
        "Hunter barbershop was created as exactly such a place. We do not simply cut hair. We return clarity.",
        "We believe in the uncompromising law of form and content: negligence breeds chaos. In contrast, a flawless, millimeter-precise cut becomes a point of support. Grooming is the act of cutting away what is unnecessary.",
        "Order on your head is the foundation of order in your mind.",
        "When the barber turns off the clipper and you look into the mirror, you see more than an ideal contour. You feel structure. Chaos gives way to system. The mind turns cold and the focus becomes razor sharp.",
        "You are ready to hunt again.",
      ],
      panelTitle: "Online booking",
      panelDescription: "Choose a service on the hero screen first, then open the full date and time panel.",
    },
  }[language];

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("/api/public/services");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Failed to fetch services");
      }

      return (result.data as ServiceOption[]).filter((service) => service.is_active);
    },
  });

  const services = servicesQuery.data ?? [];

  return (
    <section className="relative min-h-screen flex items-start overflow-hidden">
      {/* Pure black background — no image */}
      <div className="absolute inset-0 bg-background z-0" />
      {/* Large grid overlay to avoid empty hero background */}
      <div className="absolute inset-0 hero-grid pointer-events-none z-[1]" />
      {/* Solid patch behind the logo so the grid does not cut through it */}
      <div
        className="absolute left-[66%] top-[6.5rem] -translate-x-1/2 z-[2] w-[17.5rem] sm:w-[20.5rem] md:left-[72%] md:top-[18%] md:w-[37rem] aspect-square rounded-full bg-background pointer-events-none select-none"
      />
      {/* Logo placed under the text */}
      <div
        className="absolute left-[66%] top-[6.5rem] -translate-x-1/2 z-[3] w-[16rem] sm:w-[19rem] md:left-[72%] md:top-[18%] md:w-[34rem] aspect-square rounded-full bg-white/90 overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.12)] opacity-60 md:opacity-70 pointer-events-none select-none"
      >
        <img
          src={heroLogoUrl}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full object-cover scale-[1.18]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 md:px-12 pt-[15rem] sm:pt-[17rem] md:pt-[12.25rem] pb-12 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="lg:ml-8"
        >
          <h1 className="font-display text-[2.75rem] sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[0.92] sm:leading-[0.95] text-foreground mb-5 md:mb-[55px] max-w-[11ch]">
            {copy.titleMain}
            <br />
            <span className="italic">{copy.titleAccent}</span>
          </h1>
          <p className="font-body text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/80 md:text-muted-foreground mb-3 -mt-1">
            {copy.eyebrow}
          </p>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-sm md:max-w-md leading-relaxed">
            {copy.description}
            <br />
            {copy.tagline}
          </p>
          <button
            type="button"
            onClick={() => setIsManifestoOpen(true)}
            className="mt-7 md:mt-10 font-body text-[10px] sm:text-xs tracking-[0.18em] uppercase text-foreground underline underline-offset-[10px] decoration-border hover:decoration-foreground transition-colors duration-300"
          >
            {copy.manifestoLink}
          </button>
          <div className="mt-24 sm:mt-20 md:mt-36 w-full max-w-[22rem] sm:max-w-xl border border-border bg-background/75 backdrop-blur-md p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="h-12 w-full border-border bg-background px-4 font-body text-sm text-foreground">
                  <SelectValue placeholder={servicesQuery.isLoading ? copy.loadingServices : copy.chooseService} />
                </SelectTrigger>
                <SelectContent className="border-border bg-background text-foreground">
                  {services.map((service) => (
                    <SelectItem
                      key={service.id}
                      value={service.id}
                      className="font-body text-sm text-foreground focus:bg-card focus:text-foreground"
                    >
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                disabled={!selectedServiceId}
                className="h-12 w-full md:w-auto px-6 font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background transition-colors duration-300 hover:bg-accent hover:text-foreground disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {copy.findTime}
              </button>
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

      <Sheet open={isManifestoOpen} onOpenChange={setIsManifestoOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-border bg-background text-foreground sm:max-w-2xl">
          <SheetHeader className="mb-10 border-b border-border pb-6">
            <SheetTitle className="font-display text-3xl md:text-4xl font-light">
              {copy.manifestoTitle}
            </SheetTitle>
            <SheetDescription className="font-body text-sm leading-relaxed text-muted-foreground">
              {copy.manifestoDescription}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pr-2">
            {copy.manifestoParagraphs.map((paragraph, index) => (
              <p
                key={`${paragraph.slice(0, 16)}-${index}`}
                className={`leading-relaxed ${
                  index === copy.manifestoParagraphs.length - 1 || index === 4
                    ? "font-display text-3xl md:text-4xl font-light text-foreground"
                    : "text-sm md:text-base text-muted-foreground"
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default HeroSection;
