import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Crown, History, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

type AccountProfile = {
  id: string;
  name: string;
  phone: string;
  level: string;
  bonusPoints: number;
  nextVisit: {
    scheduledAt: string | null;
    service: string;
    barber: string;
  };
  history: Array<{
    date: string;
    service: string;
    result: string;
  }>;
};

const Account = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const requestedMethod = searchParams.get("method");
  const [googleAccount, setGoogleAccount] = useState<AccountProfile | null>(null);
  const [phoneAccount, setPhoneAccount] = useState<AccountProfile | null>(null);
  const [needsPhoneLink, setNeedsPhoneLink] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [phoneStep, setPhoneStep] = useState<"phone" | "otp">("phone");
  const [otpError, setOtpError] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [linkPhone, setLinkPhone] = useState("");
  const [linkOtpCode, setLinkOtpCode] = useState("");
  const [linkStep, setLinkStep] = useState<"phone" | "otp">("phone");
  const [linkError, setLinkError] = useState("");
  const [linkHint, setLinkHint] = useState("");
  const [isLinkSending, setIsLinkSending] = useState(false);
  const [isLinkVerifying, setIsLinkVerifying] = useState(false);

  const crmLoginHref =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000/admin/login`
      : "http://127.0.0.1:3000/admin/login";

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/public/account/session");
        const result = await response.json();

        if (!response.ok || !result.success || !result.data?.authenticated || !result.data.account) {
          return;
        }

        if (result.data.provider === "google") {
          setGoogleAccount(result.data.account as AccountProfile);
          setNeedsPhoneLink(Boolean(result.data.needsPhoneLink));
        }

        if (result.data.provider === "phone") {
          setPhoneAccount(result.data.account as AccountProfile);
          setNeedsPhoneLink(false);
        }
      } catch {
        return;
      }
    };

    void fetchSession();
  }, [requestedMethod]);

  useEffect(() => {
    if (requestedMethod !== "phone") {
      setOtpError("");
      setOtpHint("");
      return;
    }
  }, [requestedMethod]);

  const activeAccount = googleAccount ?? phoneAccount;
  const isPhoneFlow = requestedMethod === "phone";
  const isGoogleFlow = requestedMethod === "google";

  const handleGoBack = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/";
  };

  const formatVisitDate = (value: string | null) => {
    if (!value) {
      return language === "ru" ? "После первой записи появится здесь" : "It will appear after the first booking";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleRequestPhoneCode = async () => {
    setOtpError("");
    setOtpHint("");
    setIsSendingCode(true);

    try {
      const response = await fetch("/api/public/account/phone/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setOtpError(result.error ?? (language === "ru" ? "Не удалось отправить код." : "Failed to send code."));
        return;
      }

      setPhone(result.data.phone);
      setOtpCode("");
      setPhoneStep("otp");
      setOtpHint(
        language === "ru"
          ? `Код отправлен на ${result.data.maskedPhone}.`
          : `The code was sent to ${result.data.maskedPhone}.`,
      );
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : language === "ru"
            ? "Не удалось отправить код."
            : "Failed to send code.",
      );
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    setOtpError("");
    setIsVerifyingCode(true);

    try {
      const response = await fetch("/api/public/account/phone/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          code: otpCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setOtpError(result.error ?? (language === "ru" ? "Код подтверждения неверный." : "Invalid verification code."));
        return;
      }

      setGoogleAccount(null);
      setPhoneAccount(result.data as AccountProfile);
      setOtpCode("");
      setOtpHint("");
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : language === "ru"
            ? "Не удалось подтвердить код."
            : "Failed to verify code.",
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const resetPhoneFlow = () => {
    setPhoneStep("phone");
    setOtpCode("");
    setOtpError("");
    setOtpHint("");
  };

  const handleLogout = () => {
    void fetch("/api/public/account/logout", {
      method: "POST",
    });
    setGoogleAccount(null);
    setPhoneAccount(null);
    setNeedsPhoneLink(false);
    resetPhoneFlow();
    resetLinkPhoneFlow();
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/public/account/google/start";
  };

  const resetLinkPhoneFlow = () => {
    setLinkStep("phone");
    setLinkPhone("");
    setLinkOtpCode("");
    setLinkError("");
    setLinkHint("");
  };

  const handleRequestLinkPhoneCode = async () => {
    setLinkError("");
    setLinkHint("");
    setIsLinkSending(true);

    try {
      const response = await fetch("/api/public/account/phone/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: linkPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setLinkError(result.error ?? (language === "ru" ? "Не удалось отправить код." : "Failed to send code."));
        return;
      }

      setLinkPhone(result.data.phone);
      setLinkOtpCode("");
      setLinkStep("otp");
      setLinkHint(
        language === "ru"
          ? `Код отправлен на ${result.data.maskedPhone}.`
          : `The code was sent to ${result.data.maskedPhone}.`,
      );
    } catch (error) {
      setLinkError(
        error instanceof Error
          ? error.message
          : language === "ru"
            ? "Не удалось отправить код."
            : "Failed to send code.",
      );
    } finally {
      setIsLinkSending(false);
    }
  };

  const handleVerifyLinkedPhone = async () => {
    setLinkError("");
    setIsLinkVerifying(true);

    try {
      const response = await fetch("/api/public/account/google/link-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: linkPhone,
          code: linkOtpCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setLinkError(result.error ?? (language === "ru" ? "Не удалось подтвердить номер." : "Failed to verify phone."));
        return;
      }

      setGoogleAccount(result.data as AccountProfile);
      setNeedsPhoneLink(false);
      resetLinkPhoneFlow();
    } catch (error) {
      setLinkError(
        error instanceof Error
          ? error.message
          : language === "ru"
            ? "Не удалось подтвердить номер."
            : "Failed to verify phone.",
      );
    } finally {
      setIsLinkVerifying(false);
    }
  };

  const copy = {
    ru: {
      eyebrow: "Личный кабинет",
      title: "Вход в личный кабинет",
      description:
        "Войдите в личный кабинет, чтобы посмотреть будущие записи, историю визитов и персональные условия.",
      phoneTitle: "Вход по номеру",
      phoneDescription: "Введите номер телефона. Мы отправим 4-значный код подтверждения, чтобы открыть личный кабинет.",
      googleTitle: "Вход через Google",
      googleDescription: "Откройте вход через Google, чтобы сразу попасть в личный кабинет без временных логинов и паролей.",
      linkPhoneTitle: "Подтвердите номер телефона",
      linkPhoneDescription:
        "Один раз подтвердите свой номер, чтобы связать Google-вход с вашим клиентским профилем и открыть историю визитов, записи и бонусы.",
      linkPhoneButton: "Связать номер",
      linkPhoneLater: "Сделать позже",
      username: "Логин",
      password: "Пароль",
      phoneLabel: "Номер телефона",
      phonePlaceholder: "+7 (___) ___-__-__",
      sendCode: "Получить код",
      otpTitle: "Подтвердите номер",
      otpDescription: "Введите 4-значный код, который мы отправили на ваш телефон.",
      verifyCode: "Подтвердить код",
      resendCode: "Отправить код ещё раз",
      changePhone: "Изменить номер",
      noHistoryYet: "После первого визита история появится здесь.",
      continueWithGoogle: "Продолжить через Google",
      signIn: "Войти в кабинет",
      signedAs: "Активный профиль",
      back: "Назад",
      nextVisit: "Следующий визит",
      history: "История посещений",
      bonuses: "Бонусы и статус",
      switchAccount: "Сменить аккаунт",
      logout: "Выйти",
      crmEntry: "CRM для мастера",
      crmDesc: "Если нужно посмотреть административную часть, открой вход в CRM отдельно.",
      bonusLabel: "бонусных баллов",
      barber: "Барбер",
      visitorMode: "Режим посетителя",
      level: "Статус",
      noAccounts: "Выберите способ входа, чтобы открыть личный кабинет.",
    },
    en: {
      eyebrow: "Client account",
      title: "Account sign in",
      description:
        "Sign in to the account to view upcoming bookings, visit history and personal conditions.",
      phoneTitle: "Phone sign in",
      phoneDescription: "Enter your phone number. We will send a 4-digit verification code to open your account.",
      googleTitle: "Continue with Google",
      googleDescription: "Use real Google sign-in to open your account without temporary demo credentials.",
      linkPhoneTitle: "Verify your phone number",
      linkPhoneDescription:
        "Confirm your phone once to connect Google sign-in with your client profile and unlock visit history, bookings and bonuses.",
      linkPhoneButton: "Link phone",
      linkPhoneLater: "Later",
      username: "Login",
      password: "Password",
      phoneLabel: "Phone number",
      phonePlaceholder: "+7 (___) ___-__-__",
      sendCode: "Send code",
      otpTitle: "Verify your number",
      otpDescription: "Enter the 4-digit code that we sent to your phone.",
      verifyCode: "Verify code",
      resendCode: "Send code again",
      changePhone: "Change number",
      noHistoryYet: "Your visit history will appear after the first booking.",
      continueWithGoogle: "Continue with Google",
      signIn: "Sign in",
      signedAs: "Active profile",
      back: "Back",
      nextVisit: "Next visit",
      history: "Visit history",
      bonuses: "Bonuses and status",
      switchAccount: "Switch account",
      logout: "Log out",
      crmEntry: "CRM for barber",
      crmDesc: "If you need the admin side, open the CRM login separately.",
      bonusLabel: "bonus points",
      barber: "Barber",
      visitorMode: "Visitor mode",
      level: "Level",
      noAccounts: "Choose a sign-in method to open your account.",
    },
  }[language];

  if (!activeAccount) {
    return (
      <main className="section-grid section-grid-strong min-h-screen bg-background text-foreground px-6 py-32">
        <div className="mx-auto max-w-[56rem] border border-border bg-card/70 p-8 md:p-9">
          <button
            type="button"
            onClick={handleGoBack}
            className="mb-6 inline-flex items-center gap-2 border border-border bg-background/70 px-4 py-3 text-foreground transition-colors duration-300 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.back}</span>
          </button>
          <p className="font-body text-xs tracking-[0.22em] uppercase text-muted-foreground mb-4">
            {copy.eyebrow}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-light leading-[0.94] mb-6">
            {isPhoneFlow ? copy.phoneTitle : isGoogleFlow ? copy.googleTitle : copy.title}
          </h1>
          <p className="max-w-[38rem] font-body text-sm md:text-base leading-relaxed text-muted-foreground mb-8">
            {isPhoneFlow ? copy.phoneDescription : isGoogleFlow ? copy.googleDescription : copy.description}
          </p>

          {isPhoneFlow ? (
            <div className="max-w-[34rem] border border-border bg-background/60 p-5 md:p-6">
              {phoneStep === "phone" ? (
                <div className="grid gap-4">
                  <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">
                    {copy.phoneLabel}
                  </p>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={copy.phonePlaceholder}
                    className="h-12 border border-border bg-background px-4 font-body text-sm text-foreground outline-none"
                  />
                  {otpError ? <p className="font-body text-xs text-destructive">{otpError}</p> : null}
                  <button
                    type="button"
                    onClick={handleRequestPhoneCode}
                    disabled={!phone.trim() || isSendingCode}
                    className={cn(
                      "inline-flex items-center justify-center border px-5 py-4 transition-colors duration-300",
                      !phone.trim() || isSendingCode
                        ? "border-border bg-foreground text-background/55 cursor-not-allowed"
                        : "border-border bg-foreground text-background hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="font-body text-xs uppercase tracking-[0.16em]">
                      {isSendingCode ? `${copy.sendCode}...` : copy.sendCode}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  <div>
                    <p className="font-display text-2xl font-light text-foreground mb-2">{copy.otpTitle}</p>
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">{copy.otpDescription}</p>
                  </div>

                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={otpCode}
                      onChange={setOtpCode}
                      containerClassName="justify-center gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot
                          index={0}
                          className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {otpHint ? <p className="font-body text-sm text-muted-foreground text-center">{otpHint}</p> : null}
                  {otpError ? <p className="font-body text-xs text-destructive text-center">{otpError}</p> : null}

                  <button
                    type="button"
                    onClick={handleVerifyPhoneCode}
                    disabled={otpCode.length !== 4 || isVerifyingCode}
                    className={cn(
                      "inline-flex items-center justify-center border px-5 py-4 transition-colors duration-300",
                      otpCode.length !== 4 || isVerifyingCode
                        ? "border-border bg-foreground text-background/55 cursor-not-allowed"
                        : "border-border bg-foreground text-background hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="font-body text-xs uppercase tracking-[0.16em]">
                      {isVerifyingCode ? `${copy.verifyCode}...` : copy.verifyCode}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleRequestPhoneCode}
                      className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                    >
                      {copy.resendCode}
                    </button>
                    <button
                      type="button"
                      onClick={resetPhoneFlow}
                      className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                    >
                      {copy.changePhone}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isGoogleFlow ? (
            <div className="max-w-[34rem] border border-border bg-background/60 p-5 md:p-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="inline-flex w-full items-center justify-center border border-border bg-foreground px-5 py-4 text-background transition-colors duration-300 hover:bg-accent hover:text-foreground"
              >
                <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.continueWithGoogle}</span>
              </button>
            </div>
          ) : (
            <p className="font-body text-sm text-muted-foreground">{copy.noAccounts}</p>
          )}

          <a
            href={crmLoginHref}
            className="mt-8 inline-flex items-center gap-3 border border-border bg-foreground px-5 py-4 text-background transition-colors duration-300 hover:bg-accent hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.crmEntry}</span>
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-24">
      <div className="mx-auto max-w-6xl grid gap-6">
        <div>
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 border border-border bg-background/70 px-4 py-3 text-foreground transition-colors duration-300 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.back}</span>
          </button>
        </div>

        <section className="border border-border bg-card/70 p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-body text-xs tracking-[0.22em] uppercase text-muted-foreground mb-4">
                {copy.signedAs}
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-light leading-[0.94] mb-3">
                {activeAccount.name}
              </h1>
              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                {copy.visitorMode}. {copy.crmDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border border-border bg-background/70 px-5 py-4 text-foreground transition-colors duration-300 hover:bg-card"
              >
                <UserRound className="h-4 w-4" />
                <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.switchAccount}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border border-border bg-background/70 px-5 py-4 text-foreground transition-colors duration-300 hover:bg-card"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.logout}</span>
              </button>
              <a
                href={crmLoginHref}
                className="inline-flex items-center gap-2 border border-border bg-foreground px-5 py-4 text-background transition-colors duration-300 hover:bg-accent hover:text-foreground"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.crmEntry}</span>
              </a>
            </div>
          </div>
        </section>

        {googleAccount && needsPhoneLink ? (
          <section className="border border-border bg-card/70 p-8 md:p-10">
            <div className="max-w-3xl grid gap-6">
              <div>
                <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground mb-3">
                  {copy.phoneTitle}
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-light leading-[0.96] mb-4">{copy.linkPhoneTitle}</h2>
                <p className="font-body text-sm md:text-base leading-relaxed text-muted-foreground">
                  {copy.linkPhoneDescription}
                </p>
              </div>

              <div className="max-w-[34rem] border border-border bg-background/60 p-5 md:p-6">
                {linkStep === "phone" ? (
                  <div className="grid gap-4">
                    <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">
                      {copy.phoneLabel}
                    </p>
                    <input
                      value={linkPhone}
                      onChange={(event) => setLinkPhone(event.target.value)}
                      placeholder={copy.phonePlaceholder}
                      className="h-12 border border-border bg-background px-4 font-body text-sm text-foreground outline-none"
                    />
                    {linkError ? <p className="font-body text-xs text-destructive">{linkError}</p> : null}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleRequestLinkPhoneCode}
                        disabled={!linkPhone.trim() || isLinkSending}
                        className={cn(
                          "inline-flex items-center justify-center border px-5 py-4 transition-colors duration-300",
                          !linkPhone.trim() || isLinkSending
                            ? "border-border bg-foreground text-background/55 cursor-not-allowed"
                            : "border-border bg-foreground text-background hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <span className="font-body text-xs uppercase tracking-[0.16em]">
                          {isLinkSending ? `${copy.sendCode}...` : copy.linkPhoneButton}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNeedsPhoneLink(false)}
                        className="inline-flex items-center justify-center border border-border bg-background/70 px-5 py-4 text-foreground transition-colors duration-300 hover:bg-card"
                      >
                        <span className="font-body text-xs uppercase tracking-[0.16em]">{copy.linkPhoneLater}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    <div>
                      <p className="font-display text-2xl font-light text-foreground mb-2">{copy.otpTitle}</p>
                      <p className="font-body text-sm leading-relaxed text-muted-foreground">{copy.otpDescription}</p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={linkOtpCode}
                        onChange={setLinkOtpCode}
                        containerClassName="justify-center gap-3"
                      >
                        <InputOTPGroup className="gap-3">
                          <InputOTPSlot index={0} className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md" />
                          <InputOTPSlot index={1} className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md" />
                          <InputOTPSlot index={2} className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md" />
                          <InputOTPSlot index={3} className="h-12 w-12 rounded-md border border-border bg-background text-lg font-semibold first:rounded-md first:border last:rounded-md" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {linkHint ? <p className="font-body text-sm text-muted-foreground text-center">{linkHint}</p> : null}
                    {linkError ? <p className="font-body text-xs text-destructive text-center">{linkError}</p> : null}

                    <button
                      type="button"
                      onClick={handleVerifyLinkedPhone}
                      disabled={linkOtpCode.length !== 4 || isLinkVerifying}
                      className={cn(
                        "inline-flex items-center justify-center border px-5 py-4 transition-colors duration-300",
                        linkOtpCode.length !== 4 || isLinkVerifying
                          ? "border-border bg-foreground text-background/55 cursor-not-allowed"
                          : "border-border bg-foreground text-background hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <span className="font-body text-xs uppercase tracking-[0.16em]">
                        {isLinkVerifying ? `${copy.verifyCode}...` : copy.verifyCode}
                      </span>
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleRequestLinkPhoneCode}
                        className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                      >
                        {copy.resendCode}
                      </button>
                      <button
                        type="button"
                        onClick={resetLinkPhoneFlow}
                        className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                      >
                        {copy.changePhone}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border border-border bg-card/70 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <CalendarClock className="h-5 w-5 text-foreground" />
              <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">{copy.nextVisit}</p>
            </div>
            <p className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">
              {activeAccount.nextVisit.service}
            </p>
            <p className="font-body text-base text-muted-foreground mb-2">
              {formatVisitDate(activeAccount.nextVisit.scheduledAt)}
            </p>
            <p className="font-body text-sm text-foreground/80">
              {copy.barber}: {activeAccount.nextVisit.barber}
            </p>
          </div>

          <div className="border border-border bg-card/70 p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <Crown className="h-5 w-5 text-foreground" />
              <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">{copy.bonuses}</p>
            </div>
            <p className="font-display text-3xl md:text-5xl font-light text-foreground mb-3">
              {activeAccount.bonusPoints}
            </p>
            <p className="font-body text-sm text-muted-foreground mb-4">{copy.bonusLabel}</p>
            <div className="border border-border bg-background/50 px-4 py-3">
              <p className="font-body text-xs uppercase tracking-[0.16em] text-muted-foreground mb-1">{copy.level}</p>
              <p className="font-display text-2xl font-light text-foreground">{activeAccount.level}</p>
            </div>
          </div>
        </section>

        <section className="border border-border bg-card/70 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-5 w-5 text-foreground" />
            <p className="font-body text-xs tracking-[0.18em] uppercase text-muted-foreground">{copy.history}</p>
          </div>

          <div className="grid gap-4">
            {activeAccount.history.length ? (
              activeAccount.history.map((item, index) => (
                <div
                  key={`${item.date}-${item.service}-${index}`}
                  className={cn(
                    "grid gap-3 border border-border bg-background/50 p-5 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1.1fr)] md:items-start",
                  )}
                >
                  <p className="font-body text-sm text-muted-foreground">{formatVisitDate(item.date)}</p>
                  <p className="font-display text-2xl font-light text-foreground">{item.service}</p>
                  <p className="font-body text-sm leading-relaxed text-foreground/80">{item.result}</p>
                </div>
              ))
            ) : (
              <p className="font-body text-sm text-muted-foreground">{copy.noHistoryYet}</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Account;
