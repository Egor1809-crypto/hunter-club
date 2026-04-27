import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleUserRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const cosmeticsItems = [
  {
    name: "Matte Clay",
    type: "Укладка",
    description: "Матовая глина для текстуры, контроля и плотной фиксации без тяжёлого блеска.",
  },
  {
    name: "Beard Oil",
    type: "Борода",
    description: "Масло для мягкости бороды и аккуратного ежедневного ухода за кожей.",
  },
  {
    name: "Sea Salt Spray",
    type: "Текстура",
    description: "Солевой спрей для лёгкого объёма и живой формы после укладки.",
  },
];

const navLinkClassName =
  "font-body whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-300 hover:text-foreground";

const mobileNavLinkClassName =
  "font-body whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:text-foreground";

const dividerClassName = "h-px w-7 bg-border/80";

const HunterNav = () => {
  const { language } = useLanguage();

  const copy = {
    ru: {
      logo: "Hunter",
      account: "Личный кабинет",
      cosmeticsDialogTitle: "Косметика",
      cosmeticsDialogDesc: "Подборка средств, которые поддерживают результат стрижки и ухода дома.",
      left: [
        { label: "Услуги", href: "#services" },
        { label: "Косметика", href: "#cosmetics", kind: "dialog" as const },
        { label: "Отзывы", href: "#reviews" },
      ],
      right: [
        { label: "О нас", href: "#about" },
        { label: "Контакт", href: "#contact" },
        { label: "Записаться", href: "#services-booking" },
      ],
    },
    en: {
      logo: "Hunter",
      account: "Account",
      cosmeticsDialogTitle: "Products",
      cosmeticsDialogDesc: "A curated set of products that help maintain your cut and grooming at home.",
      left: [
        { label: "Services", href: "#services" },
        { label: "Products", href: "#cosmetics", kind: "dialog" as const },
        { label: "Reviews", href: "#reviews" },
      ],
      right: [
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Book now", href: "#services-booking" },
      ],
    },
  }[language];

  const renderItem = (item: (typeof copy.left)[number] | (typeof copy.right)[number]) => {
    if (item.kind === "dialog") {
      return (
        <Dialog key={item.label}>
          <DialogTrigger asChild>
            <button type="button" className={navLinkClassName}>
              {item.label}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-light">{copy.cosmeticsDialogTitle}</DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground">
                {copy.cosmeticsDialogDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
              {cosmeticsItems.map((product) => (
                <div key={product.name} className="border border-border bg-card/60 p-5">
                  <p className="mb-3 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {product.type}
                  </p>
                  <p className="mb-3 font-display text-2xl font-light text-foreground">{product.name}</p>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <a key={item.href} href={item.href} className={navLinkClassName}>
        {item.label}
      </a>
    );
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/98 backdrop-blur-md">
      <div className="lg:hidden">
        <div className="flex min-h-[72px] items-center justify-between px-4">
          <a
            href="#"
            className="font-display text-[2.35rem] font-light uppercase leading-none tracking-[0.14em] text-foreground"
          >
            {copy.logo}
          </a>
          <a
            href="/account"
            className="inline-flex h-11 w-11 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
            aria-label={copy.account}
          >
            <CircleUserRound className="h-5 w-5" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-x-3 gap-y-3 border-t border-border/70 px-4 py-3 text-center">
          {[...copy.left, ...copy.right].map((item) => {
            if (item.kind === "dialog") {
              return (
                <Dialog key={item.label}>
                  <DialogTrigger asChild>
                    <button type="button" className={mobileNavLinkClassName}>
                      {item.label}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[92vw] border-border bg-background text-foreground">
                    <DialogHeader>
                      <DialogTitle className="font-display text-3xl font-light">
                        {copy.cosmeticsDialogTitle}
                      </DialogTitle>
                      <DialogDescription className="font-body text-sm text-muted-foreground">
                        {copy.cosmeticsDialogDesc}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 grid grid-cols-1 gap-4">
                      {cosmeticsItems.map((product) => (
                        <div key={product.name} className="border border-border bg-card/60 p-5">
                          <p className="mb-3 font-body text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {product.type}
                          </p>
                          <p className="mb-3 font-display text-2xl font-light text-foreground">{product.name}</p>
                          <p className="font-body text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            }

            return (
              <a key={item.href} href={item.href} className={mobileNavLinkClassName}>
                {item.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-x-auto px-6 sm:px-10 lg:block lg:px-16">
        <div className="relative mx-auto grid min-h-[132px] min-w-[1120px] max-w-[1520px] grid-cols-[1fr_auto_1fr] items-center border-b border-border/70">
          <div className="flex items-center justify-end gap-5 pr-5">
            {copy.left.map((item, index) => (
              <div key={item.label} className="flex items-center gap-5">
                {renderItem(item)}
                <span className={dividerClassName} aria-hidden="true" />
              </div>
            ))}
          </div>

          <a
            href="#"
            className="px-8 text-center font-display text-[4.2rem] font-light uppercase leading-none tracking-[0.12em] text-foreground"
          >
            {copy.logo}
          </a>

          <div className="flex items-center gap-5 pl-5 pr-16">
            <span className={dividerClassName} aria-hidden="true" />
            {copy.right.map((item, index) => (
              <div key={item.label} className="flex items-center gap-5">
                {renderItem(item)}
                {index < copy.right.length - 1 ? <span className={dividerClassName} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>

          <a
            href="/account"
            className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:text-foreground"
            aria-label={copy.account}
          >
            <CircleUserRound className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default HunterNav;
