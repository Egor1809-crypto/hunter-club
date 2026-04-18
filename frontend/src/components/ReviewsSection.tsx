import { FormEvent, TouchEvent, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const renderStars = (rating: string) => {
  const filled = Math.max(0, Math.min(5, Math.round(Number(rating))));
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < filled ? "text-amber-400" : "text-white/20"}>★</span>
  ));
};

const hasPhoneLikeContent = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 6;
};

const ReviewCard = ({
  review,
  language,
  guestLabel,
}: {
  review: (typeof reviews)[number];
  language: "ru" | "en";
  guestLabel: string;
}) => (
  <div className="flex-shrink-0 w-full min-h-[25rem] md:h-[26rem] border border-white/20 bg-card backdrop-blur-md p-5 md:p-6 flex flex-col justify-between overflow-hidden">
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-[2.75rem] items-start justify-between gap-4">
        <span className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          {language === "ru" ? review.service : review.serviceEn}
        </span>
        <span className="font-body text-sm text-foreground whitespace-nowrap">{review.rating}</span>
      </div>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <p className="font-display text-4xl leading-none text-white/18">"</p>
        <p className="mt-3 max-w-[680px] font-display text-[24px] md:text-[28px] lg:text-[32px] leading-[1.52] text-foreground">
          {language === "ru" ? review.quote : review.quoteEn}
        </p>
      </div>
    </div>
    <div className="flex min-h-[6.5rem] flex-col justify-end pt-8 space-y-2">
      <div className="h-px w-10 bg-white/20" />
      <p className="font-display text-2xl font-light text-foreground">
        {language === "ru" ? review.name : review.nameEn}
      </p>
      <p className="font-body text-[11px] uppercase tracking-[0.18em] text-foreground/60">{guestLabel}</p>
      <div className="flex gap-1 text-base">{renderStars(review.rating)}</div>
    </div>
  </div>
);

const ReviewsSection = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const copy = {
    ru: {
      title: "Славные отзывы",
      guest: "Гость Hunter",
      prev: "Назад",
      next: "Вперёд",
      formTitle: "Поделитесь впечатлением",
      formDescription: "Коротко расскажите, как прошёл визит. Отзыв можно оставить прямо на сайте.",
      name: "Ваше имя",
      nameWarning: "Проверьте, правильно ли заполнено поле имени.",
      service: "Какая услуга",
      message: "Ваш отзыв",
      rating: "Ваша оценка",
      submit: "Отправить отзыв",
      submitting: "Отправляем...",
      successTitle: "Спасибо за отзыв",
      successDescription: "Отзыв отправлен и уже доступен в CRM.",
      errorTitle: "Не удалось отправить отзыв",
      errorDescription: "Попробуйте ещё раз через пару секунд.",
      widgetTitle: "Поделиться впечатлением",
      widgetDescription: "Откройте компактное окно и оставьте отзыв без лишнего шума на странице.",
      widgetButton: "Оставить отзыв",
    },
    en: {
      title: "Glorious reviews",
      guest: "Hunter guest",
      prev: "Previous",
      next: "Next",
      formTitle: "Share your impression",
      formDescription: "Tell us briefly how your visit went. You can leave feedback right on the website.",
      name: "Your name",
      nameWarning: "Please check whether the name field is filled correctly.",
      service: "Service received",
      message: "Your review",
      rating: "Your rating",
      submit: "Send review",
      submitting: "Sending...",
      successTitle: "Thanks for your review",
      successDescription: "Your review has been sent and is now available in the CRM.",
      errorTitle: "Could not send the review",
      errorDescription: "Please try again in a moment.",
      widgetTitle: "Share your impression",
      widgetDescription: "Open a compact panel and leave a review without taking up extra space on the page.",
      widgetButton: "Leave a review",
    },
  }[language];
  const nameLooksLikePhone = hasPhoneLikeContent(name);

  const handlePrev = useCallback(() => {
    setActiveIndex((c) => (c - 1 + reviews.length) % reviews.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((c) => (c + 1) % reviews.length);
  }, []);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) > 48) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setTouchStartX(null);
  };

  useEffect(() => {
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, serviceLabel: service, rating, message }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error ?? copy.errorDescription);
      toast({ title: copy.successTitle, description: copy.successDescription });
      setName("");
      setService("");
      setMessage("");
      setRating(5);
      setIsReviewOpen(false);
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
    <section
      id="reviews"
      className="section-golden section-grid bg-background overflow-hidden scroll-mt-[4.5rem] md:scroll-mt-[5.25rem] lg:scroll-mt-[5.75rem]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12 md:mb-16"
        >
          <div>
            <h2 className="font-display text-4xl md:text-6xl font-light text-foreground leading-[0.95]">{copy.title}</h2>
          </div>
        </motion.div>

        <div className="relative">
          <button
            onClick={handlePrev}
            aria-label={copy.prev}
            className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-card md:flex md:left-6 lg:left-[88px]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            aria-label={copy.next}
            className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-background/90 text-foreground transition-colors hover:bg-card md:flex md:right-6 lg:right-[88px]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="mx-14 overflow-hidden sm:mx-16 md:mx-20 lg:mx-24"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="mx-auto max-w-3xl touch-pan-y"
              >
                <ReviewCard review={reviews[activeIndex]} language={language} guestLabel={copy.guest} />
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn("h-2 rounded-full transition-all duration-300",
                    i === activeIndex ? "w-8 bg-foreground" : "w-2 bg-foreground/30")}
                  aria-label={`${language === "ru" ? "Отзыв" : "Review"} ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Compact review widget */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-12 md:mt-16 mx-14 sm:mx-16 md:mx-20 lg:mx-24"
        >
          <div className="mx-auto max-w-3xl border border-border bg-card/80 backdrop-blur-md p-5 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-3xl md:text-5xl font-light text-foreground leading-[0.96] mb-3">
                  {copy.widgetTitle}
                </h3>
                <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed">
                  {copy.widgetDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="w-full md:w-auto min-w-[220px] px-8 py-4 font-body text-xs tracking-[0.16em] uppercase bg-foreground text-background transition-colors duration-300 hover:bg-accent hover:text-foreground"
              >
                {copy.widgetButton}
              </button>
            </div>
          </div>
        </motion.div>

        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <DialogContent className="max-w-[92vw] border-border bg-background p-5 text-foreground sm:max-w-2xl sm:p-8">
            <DialogHeader className="border-b border-border pb-5">
              <DialogTitle className="font-display text-3xl md:text-5xl font-light leading-[0.96] text-foreground">
                {copy.formTitle}
              </DialogTitle>
              <DialogDescription className="font-body text-sm md:text-base leading-relaxed text-muted-foreground">
                {copy.formDescription}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={copy.name}
                    aria-label={copy.name}
                    aria-invalid={nameLooksLikePhone}
                    required
                    className={cn(
                      "h-12 rounded-none bg-card font-body text-sm",
                      nameLooksLikePhone ? "border-destructive/80 focus-visible:ring-destructive" : "border-border",
                    )}
                  />
                  {nameLooksLikePhone ? (
                    <p className="font-body text-xs leading-relaxed text-destructive">
                      ! {copy.nameWarning}
                    </p>
                  ) : null}
                </div>
                <Input value={service} onChange={(e) => setService(e.target.value)} placeholder={copy.service} aria-label={copy.service} required className="h-12 rounded-none border-border bg-card font-body text-sm" />
              </div>
              <div className="space-y-3">
                <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">{copy.rating}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const v = i + 1;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRating(v)}
                        aria-label={`${copy.rating}: ${v}`}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center transition-transform duration-200 hover:scale-[1.04]",
                          v <= rating ? "text-[#c6a55a]" : "text-white/22 hover:text-white/50",
                        )}
                      >
                        <Star
                          className={cn(
                            "h-[17px] w-[17px] stroke-[1.6]",
                            v <= rating ? "fill-current" : "fill-transparent",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={copy.message} aria-label={copy.message} required className="min-h-[160px] rounded-none border-border bg-card font-body text-sm" />
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "min-w-[220px] px-8 py-4 font-body text-xs tracking-[0.16em] uppercase transition-colors duration-300",
                    isSubmitting ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-foreground text-background hover:bg-accent hover:text-foreground",
                  )}
                >
                  {isSubmitting ? copy.submitting : copy.submit}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ReviewsSection;
