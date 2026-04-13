import { useLanguage } from "@/context/LanguageContext";
import LegalSection from "@/components/LegalSection";

const FooterSection = () => {
  const { language } = useLanguage();
  return (
    <footer className="relative section-grid overflow-hidden py-8 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-between gap-6 lg:px-[4rem]">
        <span className="font-display text-lg tracking-[0.2em] uppercase text-foreground">
          Hunter
        </span>
        <LegalSection />
        <span className="font-body text-xs text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Hunter Barbershop. {language === "ru" ? "Все права защищены." : "All rights reserved."}
        </span>
      </div>
    </footer>
  );
};

export default FooterSection;
