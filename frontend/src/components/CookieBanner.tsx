import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const COOKIE_STORAGE_KEY = "hunter-cookie-consent";

const CookieBanner = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(COOKIE_STORAGE_KEY);
    setIsVisible(savedConsent !== "accepted");
  }, []);

  const handleAccept = () => {
    window.localStorage.setItem(COOKIE_STORAGE_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    window.localStorage.setItem(COOKIE_STORAGE_KEY, "declined");
    setIsVisible(false);
  };

  const copy = {
    ru: {
      title: "Файлы cookie",
      description:
        "Мы используем cookie, чтобы сайт работал стабильнее, запоминал ваши настройки и делал запись удобнее.",
      accept: "Принять",
      decline: "Отклонить",
    },
    en: {
      title: "Cookies",
      description:
        "We use cookies to keep the site stable, remember your preferences and make booking more convenient.",
      accept: "Accept",
      decline: "Decline",
    },
  }[language];

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 md:bottom-4 md:left-8 md:right-8">
      <div className="mx-auto max-w-4xl border border-border bg-background/95 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between md:gap-5 md:p-6">
          <div className="max-w-2xl">
            <p className="font-display text-xl md:text-2xl font-light text-foreground">
              {copy.title}
            </p>
            <p className="mt-2 font-body text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {copy.description}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleDecline}
              className="border border-border px-4 py-3 font-body text-[10px] sm:text-xs tracking-[0.15em] uppercase text-foreground transition-colors duration-300 hover:bg-card"
            >
              {copy.decline}
            </button>
            <button
              onClick={handleAccept}
              className="bg-foreground px-4 py-3 font-body text-[10px] sm:text-xs tracking-[0.15em] uppercase text-background transition-colors duration-300 hover:bg-accent hover:text-foreground"
            >
              {copy.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
