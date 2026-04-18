import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, ShieldCheck, UserRound } from "lucide-react";
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

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.33 2.97-7.29Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.61-2.45l-3.24-2.52c-.9.61-2.05.98-3.37.98-2.59 0-4.78-1.75-5.56-4.1H3.09v2.59A10 10 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.44 13.91A5.98 5.98 0 0 1 6.13 12c0-.66.11-1.3.31-1.91V7.5H3.09A10 10 0 0 0 2 12c0 1.61.39 3.14 1.09 4.5l3.35-2.59Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.98c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 2.98 14.69 2 12 2A10 10 0 0 0 3.09 7.5l3.35 2.59c.78-2.35 2.97-4.11 5.56-4.11Z"
    />
  </svg>
);

const HunterNav = () => {
  const { language } = useLanguage();
  const navGroups = {
    ru: [
      [
        { label: "Услуги", href: "#services" },
        { label: "Косметика", href: "#cosmetics", kind: "dialog" as const },
        { label: "Отзывы", href: "#reviews" },
      ],
      [
        { label: "О нас", href: "#about" },
        { label: "Контакт", href: "#contact" },
        { label: "Записаться", href: "#services-booking", kind: "cta" as const },
      ],
    ],
    en: [
      [
        { label: "Services", href: "#services" },
        { label: "Cosmetics", href: "#cosmetics", kind: "dialog" as const },
        { label: "Reviews", href: "#reviews" },
      ],
      [
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
        { label: "Book now", href: "#services-booking", kind: "cta" as const },
      ],
    ],
  }[language];
  const copy = {
    ru: {
      cosmeticsDialogTitle: "Косметика",
      cosmeticsDialogDesc: "Подборка средств, которые поддерживают результат стрижки и ухода дома.",
      accountTitle: "Вход и регистрация",
      guestLabel: "Для посетителя",
      guestTitle: "Личный кабинет Hunter",
      guestDesc: "Выберите удобный способ, чтобы зарегистрироваться и позже смотреть историю визитов.",
      googleEntry: "Через Google",
      googleEntryDesc: "Быстрая регистрация и вход в клиентский кабинет одним нажатием.",
      phoneEntry: "По номеру",
      phoneEntryDesc: "Регистрация через телефон с подтверждением и доступом к будущим записям.",
      adminLabel: "Для мастера",
      adminEntry: "CRM Admin",
      adminEntryDesc: "Полный доступ к записям, клиентам, услугам, отзывам и внутренней CRM.",
    },
    en: {
      cosmeticsDialogTitle: "Cosmetics",
      cosmeticsDialogDesc: "A curated set of products that help maintain your cut and grooming at home.",
      accountTitle: "Access",
      guestLabel: "For visitor",
      guestTitle: "Hunter account",
      guestDesc: "Choose the most convenient way to sign up and later view your visit history.",
      googleEntry: "With Google",
      googleEntryDesc: "Quick sign-up and login to the client area in one click.",
      phoneEntry: "With phone",
      phoneEntryDesc: "Phone-based registration with confirmation and access to future bookings.",
      adminLabel: "For barber",
      adminEntry: "CRM Admin",
      adminEntryDesc: "Full access to bookings, clients, services, reviews and the internal CRM.",
    },
  }[language];
  const crmLoginHref =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
      : "http://127.0.0.1:3000/admin/login";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-background/78 backdrop-blur-xl">
      <div className="max-w-[96rem] mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative flex items-center h-[4.5rem] md:h-[5.25rem] lg:h-[5.75rem] gap-3">
          <div className="flex flex-1 items-center justify-end gap-4 md:gap-5 lg:gap-7 min-w-0">
            {navGroups[0].map((item, index) => (
              <div key={item.href} className="flex items-center gap-4 md:gap-5 lg:gap-7">
                {item.kind === "dialog" ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap">
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        {cosmeticsItems.map((item) => (
                          <div key={item.name} className="border border-border bg-card/60 p-5">
                            <p className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                              {item.type}
                            </p>
                            <p className="font-display text-2xl font-light text-foreground mb-3">
                              {item.name}
                            </p>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <a
                    href={item.href}
                    className="font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                )}
                {index < navGroups[0].length - 1 && (
                  <span className="h-px w-3 md:w-4 bg-border/80" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <a
            href="#"
            className="relative shrink-0 px-6 md:px-8 lg:px-10 text-center font-display text-[1.65rem] sm:text-[2.1rem] md:text-[2.9rem] lg:text-[3.7rem] leading-none font-light tracking-[0.28em] text-foreground uppercase"
          >
            <span className="absolute left-0 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-border/80 md:block lg:w-6" aria-hidden="true" />
            HUNTER
            <span className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-border/80 md:block lg:w-6" aria-hidden="true" />
          </a>

          <div className="flex flex-1 items-center justify-start gap-4 md:gap-5 lg:gap-7 min-w-0">
            {navGroups[1].map((item, index) => (
              <div key={item.label} className="flex items-center gap-4 md:gap-5 lg:gap-7">
                {item.kind === "cta" ? (
                  <a
                    href={item.href}
                    className="font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                ) : (
                  <a
                    href={item.href}
                    className="font-body text-[9px] md:text-[10px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 whitespace-nowrap"
                  >
                    {item.label}
                  </a>
                )}
                {index < navGroups[1].length - 1 && (
                  <span className="h-px w-3 md:w-4 bg-border/80" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label={copy.accountTitle}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-border/80 bg-background/70 text-foreground transition-colors duration-300 hover:bg-card"
              >
                <UserRound className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-xl border-border bg-background text-foreground">
              <DialogHeader>
                <DialogTitle className="font-display text-3xl font-light">{copy.accountTitle}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="border border-border bg-card/60 p-5 md:p-6">
                  <p className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                    {copy.guestLabel}
                  </p>
                  <p className="font-display text-2xl md:text-3xl font-light text-foreground mb-3">
                    {copy.guestTitle}
                  </p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
                    {copy.guestDesc}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <a
                      href="/account?method=google"
                      className="border border-border bg-background/70 p-4 transition-colors duration-300 hover:bg-card"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center border border-border/80">
                        <GoogleMark />
                      </div>
                      <p className="font-display text-xl font-light text-foreground mb-2">{copy.googleEntry}</p>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {copy.googleEntryDesc}
                      </p>
                    </a>
                    <a
                      href="/account?method=phone"
                      className="border border-border bg-background/70 p-4 transition-colors duration-300 hover:bg-card"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center border border-border/80">
                        <Phone className="h-5 w-5" />
                      </div>
                      <p className="font-display text-xl font-light text-foreground mb-2">{copy.phoneEntry}</p>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">
                        {copy.phoneEntryDesc}
                      </p>
                    </a>
                  </div>
                </div>

                <a
                  href={crmLoginHref}
                  className="border border-border bg-card/60 p-5 md:p-6 transition-colors duration-300 hover:bg-card"
                >
                  <p className="font-body text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                    {copy.adminLabel}
                  </p>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center border border-border/80">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <p className="font-display text-2xl font-light text-foreground mb-3">{copy.adminEntry}</p>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {copy.adminEntryDesc}
                  </p>
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
};

export default HunterNav;
