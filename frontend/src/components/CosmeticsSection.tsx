import { FormEvent, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const reviews = [
  {
    name: "Артём",
    nameEn: "Artyom",
    service: "Стрижка + борода",
    serviceEn: "Haircut + beard",
    quote:
      "Слава очень точно считывает, что подойдёт именно тебе. Результат чистый, аккуратный и без лишних разговоров.",
    quoteEn:
      "Slava reads exactly what suits you. The result is clean, sharp and confident without any unnecessary noise.",
    rating: "5.0",
  },
  {
    name: "Илья",
    nameEn: "Ilya",
    service: "Классическая стрижка",
    serviceEn: "Classic haircut",
    quote:
      "Тот случай, когда приходишь за услугой, а получаешь полноценный ритуал. Атмосфера сильная, сервис на уровне.",
    quoteEn:
      "That rare case when you come for a service and get a real ritual. Strong atmosphere, serious level of care.",
    rating: "5.0",
  },
  {
    name: "Максим",
    nameEn: "Maxim",
    service: "Моделирование бороды",
    serviceEn: "Beard shaping",
    quote:
      "Очень ровные линии и грамотная форма. Видно, что мастер работает не по шаблону, а под лицо и стиль.",
    quoteEn:
      "Very clean lines and smart form. You can tell the barber works for the face and style, not by template.",
    rating: "5.0",
  },
  {
    name: "Даниил",
    nameEn: "Daniil",
    service: "Бритьё опасной бритвой",
    serviceEn: "Straight razor shave",
    quote:
      "Редко где настолько внимательно относятся к деталям. После визита ощущение, будто всё собрано идеально.",
    quoteEn:
      "Few places handle details this carefully. After the visit it feels like everything is put together perfectly.",
    rating: "5.0",
  },
  {
    name: "Константин",
    nameEn: "Konstantin",
    service: "Охота на рассвете",
    serviceEn: "Dawn hunt service",
    quote:
      "Утренний слот оказался отдельным удовольствием. Тихо, спокойно, без суеты. Стрижка как ритуал перед днём.",
    quoteEn:
      "The early slot feels like a separate pleasure. Quiet, calm and focused. A haircut like a ritual before the day begins.",
    rating: "5.0",
  },
];

const cardLayout = [
  { offset: -2, x: "12%", scale: 0.85, opacity: 0.7, zIndex: 1 },
  { offset: -1, x: "27%", scale: 0.92, opacity: 0.85, zIndex: 2 },
  { offset: 0, x: "50%", scale: 1, opacity: 1, zIndex: 5 },
  { offset: 1, x: "73%", scale: 0.92, opacity: 0.85, zIndex: 2 },
  { offset: 2, x: "88%", scale: 0.85, opacity: 0.7, zIndex: 1 },
];

const renderStars = (rating: string) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(Number(rating))));

  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`${rating}-${index}`}
      className={index < filledStars ? "text-amber-400" : "text-white/20"}
    >
      ★
    </span>
  ));
};

const CosmeticsSection = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = {
    ru: {
      eyebrow: "Доверие гостей",
      title: "Славные отзывы",
      description:
        "Лента отзывов в глубину: в центре главный голос, по краям остальные впечатления от Hunter.",
      result: "Проверенный результат",
      guest: "Гость Hunter",
      prev: "Назад",
      next: "Вперёд",
      formEyebrow: "Оставить отзыв",
      formTitle: "Поделитесь впечатлением",
      formDescription: "Коротко расскажите, как прошёл визит. Отзыв можно оставить прямо на сайте.",
      name: "Ваше имя",
      service: "Какая услуга",
      message: "Ваш отзыв",
      rating: "Ваша оценка",
      submit: "Отправить отзыв",
      submitting: "Отправляем...",
      successTitle: "Спасибо за отзыв",
      successDescription: "Отзыв отправлен и уже доступен в CRM.",
      errorTitle: "Не удалось отправить отзыв",
      errorDescription: "Попробуйте ещё раз через пару секунд.",
    },
    en: {
      eyebrow: "Guest trust",
      title: "Glorious reviews",
      description:
        "A layered review strip: the main voice in the center, the rest of Hunter impressions fading into depth.",
      result: "Proven result",
      guest: "Hunter guest",
      prev: "Previous",
      next: "Next",
      formEyebrow: "Leave a review",
      formTitle: "Share your impression",
      formDescription: "Tell us briefly how your visit went. You can leave feedback right on the website.",
      name: "Your name",
      service: "Service received",
      message: "Your review",
      rating: "Your rating",
      submit: "Send review",
      submitting: "Sending...",
      successTitle: "Thanks for your review",
      successDescription: "Your review has been sent and is now available in the CRM.",
      errorTitle: "Could not send the review",
      errorDescription: "Please try again in a moment.",
    },
  }[language];

  const visibleCards = useMemo(
    () =>
      cardLayout.map((layout) => {
        const reviewIndex = (activeIndex + layout.offset + reviews.length) % reviews.length;
        return {
          ...layout,
          review: reviews[reviewIndex],
          key: `${reviews[reviewIndex].name}-${reviewIndex}-${layout.offset}`,
        };
      }),
    [activeIndex],
  );

  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % reviews.length);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name,
          serviceLabel: service,
          rating,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? copy.errorDescription);
      }

      toast({
        title: copy.successTitle,
        description: copy.successDescription,
      });
      setName("");
      setService("");
      setMessage("");
      setRating(5);
    } catch (error) {
      toast({
        title: copy.errorTitle,
        description: error instanceof Error ? error.message : copy.errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="section-golden bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-[34px] md:gap-[55px] mb-[55px] md:mb-[89px]"
        >
          <div>
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {copy.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-foreground leading-[0.95]">
              {copy.title}
            </h2>
          </div>
          <p className="font-body text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
            {copy.description}
          </p>
        </motion.div>

        <div className="relative">
          <button
            onClick={handlePrev}
            aria-label={copy.prev}
            className="absolute left-[-3rem] md:left-[-4rem] top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-border bg-background/90 text-foreground transition-colors duration-300 hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label={copy.next}
            className="absolute right-[-3rem] md:right-[-4rem] top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center border border-border bg-background/90 text-foreground transition-colors duration-300 hover:bg-card"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="relative h-[39rem] md:h-[42rem] overflow-hidden px-12 md:px-16">
            <div className="absolute inset-0 perspective-[1800px]">
              {visibleCards.map((card) => (
                <motion.article
                  key={card.key}
                  layout
                  initial={{
                    opacity: 0,
                    x: 100,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: card.opacity,
                    left: card.x,
                    scale: card.scale,
                    zIndex: card.zIndex,
                    x: "-50%",
                    y: "-50%",
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="absolute top-[42%] w-[15.5rem] md:w-[19rem]"
                  style={{ zIndex: card.zIndex }}
                >
                  <div
                    className="min-h-[24rem] border border-border bg-card shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 md:p-6 flex flex-col justify-between"
                  >
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <span className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                          {language === "ru" ? card.review.service : card.review.serviceEn}
                        </span>
                        <span className="font-body text-sm text-foreground whitespace-nowrap">
                          {card.review.rating}
                        </span>
                      </div>

                      <div className="space-y-5">
                        <p className="font-display text-5xl leading-none text-white/18">
                          "
                        </p>
                        <p className="font-body text-sm text-foreground leading-relaxed">
                          {language === "ru" ? card.review.quote : card.review.quoteEn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 space-y-3">
                      <div className="h-px w-10 bg-white/20" />
                      <p className="font-display text-2xl font-light leading-none text-foreground">
                        {language === "ru" ? card.review.name : card.review.nameEn}
                      </p>
                      <p className="font-body text-[11px] uppercase tracking-[0.18em] text-foreground/60">
                        {copy.guest}
                      </p>
                      <p className="font-body text-[11px] tracking-[0.16em] uppercase text-foreground/70 pt-2">
                        {copy.result}
                      </p>
                      <div className="flex gap-1 text-base">
                        {renderStars(card.review.rating)}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-[55px] md:mt-[89px] border border-border bg-card/80 backdrop-blur-md p-6 md:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12">
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
                {copy.formEyebrow}
              </p>
              <h3 className="font-display text-3xl md:text-5xl font-light text-foreground leading-[0.96] mb-4">
                {copy.formTitle}
              </h3>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                {copy.formDescription}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.name}
                  required
                  className="h-12 rounded-none border-border bg-background font-body text-sm"
                />
                <Input
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  placeholder={copy.service}
                  required
                  className="h-12 rounded-none border-border bg-background font-body text-sm"
                />
              </div>

              <div className="space-y-3">
                <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">
                  {copy.rating}
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const starValue = index + 1;
                    const isActive = starValue <= rating;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        className={cn(
                          "h-11 w-11 border text-xl transition-colors duration-200",
                          isActive
                            ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
                            : "border-border bg-background text-white/25 hover:text-white/60"
                        )}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.message}
                required
                className="min-h-[160px] rounded-none border-border bg-background font-body text-sm"
              />

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "min-w-[220px] px-8 py-4 font-body text-xs tracking-[0.16em] uppercase transition-colors duration-300",
                    isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:bg-accent hover:text-foreground"
                  )}
                >
                  {isSubmitting ? copy.submitting : copy.submit}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CosmeticsSection;
