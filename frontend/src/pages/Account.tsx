import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Chrome, LogOut, ShieldCheck, UserRound } from "lucide-react";

type VisitorHistoryItem = {
  date: string;
  service: string;
  result: string;
};

type VisitorAccount = {
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
  history: VisitorHistoryItem[];
};

type VisitorSessionResponse = {
  authenticated: boolean;
  provider: "google" | "phone" | null;
  account: VisitorAccount | null;
  needsPhoneLink?: boolean;
};

const panelClassName =
  "border border-border bg-card/70 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";
const labelClassName = "font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground";
const primaryButtonClassName =
  "inline-flex min-h-14 items-center justify-center border border-foreground bg-foreground px-6 text-sm uppercase tracking-[0.28em] text-background transition-colors hover:bg-transparent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClassName =
  "inline-flex min-h-14 items-center justify-center border border-border bg-transparent px-6 text-sm uppercase tracking-[0.28em] text-foreground transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-50";

const formatVisitDate = (value: string | null) => {
  if (!value) {
    return "Пока без записи";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getProductionApiBase = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
};

const unwrapResponse = async <T,>(response: Response) => {
  const payload = (await response.json()) as {
    success: boolean;
    data: T;
    error: string | null;
  };

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || "Не удалось выполнить запрос");
  }

  return payload.data;
};

const getAccountErrorMessage = (error: unknown) => {
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "Не удалось подключиться к кабинету Hunter. Проверьте, что локальный API запущен.";
  }

  return error instanceof Error ? error.message : "Не удалось выполнить запрос";
};

const AccountPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apiBase, setApiBase] = useState(() => getProductionApiBase());
  const [session, setSession] = useState<VisitorSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"default" | "error" | "success">("default");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const method = searchParams.get("method");
  const error = searchParams.get("error");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { hostname, origin } = window.location;

    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      setApiBase(origin);
      return;
    }

    let isCancelled = false;

    const discoverApiBase = async () => {
      const candidates = [`http://${hostname}:3000`, `http://${hostname}:3001`];

      for (const candidate of candidates) {
        try {
          const response = await fetch(`${candidate}/api/public/account/session`, {
            credentials: "include",
          });

          if (response.ok) {
            if (!isCancelled) {
              setApiBase(candidate);
            }
            return;
          }
        } catch {
          continue;
        }
      }

      if (!isCancelled) {
        setApiBase(candidates[0]);
      }
    };

    void discoverApiBase();

    return () => {
      isCancelled = true;
    };
  }, []);

  const loadSession = useCallback(async () => {
    if (!apiBase) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await unwrapResponse<VisitorSessionResponse>(
        await fetch(`${apiBase}/api/public/account/session`, { credentials: "include" }),
      );
      setSession(data);
    } catch (loadError) {
      setSession({
        authenticated: false,
        provider: null,
        account: null,
      });
      setStatusTone("error");
      setStatusMessage(getAccountErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!method && !error) {
      return;
    }

    if (session?.authenticated) {
      setStatusTone("default");
      setStatusMessage(null);
      navigate("/account", { replace: true });
      return;
    }

    if (isLoading || session === null) {
      return;
    }

    if (error) {
      const errorsMap: Record<string, string> = {
        google_state: "Сессия входа Google истекла. Попробуйте ещё раз.",
        google_config: "Google-вход пока не настроен до конца.",
        google_token: "Google не выдал токен входа.",
        google_userinfo: "Не удалось получить профиль Google.",
        google_account: "Не удалось создать профиль посетителя.",
        google_profile: "Не удалось собрать кабинет посетителя.",
        google_callback: "Во время возврата из Google произошла ошибка.",
      };

      setStatusTone("error");
      setStatusMessage(errorsMap[error] ?? "Не удалось завершить вход через Google.");
      return;
    }

    if (method === "google") {
      setStatusTone("success");
      setStatusMessage("Google-вход завершён. Проверяем кабинет.");
    }
  }, [method, error, isLoading, navigate, session]);

  const account = session?.account ?? null;
  const history = useMemo(() => account?.history ?? [], [account]);
  const adminLoginUrl = useMemo(() => `${apiBase}/admin/login`, [apiBase]);

  const startGoogleLogin = () => {
    window.location.assign(`${apiBase}/api/public/account/google/start?returnTo=${encodeURIComponent(window.location.origin)}`);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setStatusMessage(null);

    try {
      await unwrapResponse<{ loggedOut: true }>(
        await fetch(`${apiBase}/api/public/account/logout`, {
          method: "POST",
          credentials: "include",
        }),
      );

      setSession({
        authenticated: false,
        provider: null,
        account: null,
      });
      setStatusTone("success");
      setStatusMessage("Вы вышли из кабинета.");
    } catch (logoutError) {
      setStatusTone("error");
      setStatusMessage(getAccountErrorMessage(logoutError));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-20 text-foreground md:px-8 md:pt-24">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-3 font-body text-[11px] uppercase tracking-[0.32em] text-muted-foreground">Личный кабинет</p>
            <h1 className="font-display text-5xl font-light leading-none md:text-7xl">Hunter Account</h1>
          </div>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center gap-3 border border-border px-5 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
          <a
            href={adminLoginUrl}
            className="inline-flex min-h-12 items-center gap-3 border border-border px-5 font-body text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ShieldCheck className="h-4 w-4" />
            CRM для мастера
          </a>
        </div>

        {statusMessage ? (
          <div
            className={`border px-5 py-4 font-body text-sm ${
              statusTone === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-100"
                : statusTone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
                  : "border-border bg-card/60 text-foreground"
            }`}
          >
            {statusMessage}
          </div>
        ) : null}

        {isLoading ? (
          <section className={panelClassName}>
            <p className="font-body text-sm uppercase tracking-[0.25em] text-muted-foreground">Загружаем кабинет</p>
          </section>
        ) : session?.authenticated && account ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className={`${panelClassName} flex flex-col gap-8`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-3 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    {session.provider === "google" ? "Google-кабинет" : "Кабинет по номеру"}
                  </p>
                  <h2 className="font-display text-4xl font-light md:text-5xl">{account.name}</h2>
                </div>
                <button type="button" onClick={logout} disabled={isLoggingOut} className={secondaryButtonClassName}>
                  <LogOut className="mr-3 h-4 w-4" />
                  Выйти
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="min-w-0 border border-border bg-background/70 p-5">
                  <p className={labelClassName}>{session.provider === "google" ? "Google" : "Телефон"}</p>
                  <p className="mt-3 break-words font-body text-base leading-snug text-foreground">
                    {account.phone || "Не указан"}
                  </p>
                </div>
                <div className="min-w-0 border border-border bg-background/70 p-5">
                  <p className={labelClassName}>Статус</p>
                  <p className="mt-3 break-words font-body text-base leading-snug text-foreground">{account.level}</p>
                </div>
                <div className="min-w-0 border border-border bg-background/70 p-5">
                  <p className={labelClassName}>Бонусы</p>
                  <p className="mt-3 break-words font-body text-base leading-snug text-foreground">{account.bonusPoints}</p>
                </div>
              </div>

              <div className="border border-border bg-background/70 p-6">
                <p className={labelClassName}>Следующий визит</p>
                <div className="mt-5 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="font-display text-3xl font-light text-foreground">{account.nextVisit.service}</p>
                    <p className="mt-2 font-body text-base text-muted-foreground">{formatVisitDate(account.nextVisit.scheduledAt)}</p>
                  </div>
                  <div className="md:text-right">
                    <p className={labelClassName}>Мастер</p>
                    <p className="mt-3 font-body text-lg text-foreground">{account.nextVisit.barber}</p>
                  </div>
                </div>
              </div>

            </section>

            <section className={`${panelClassName} flex flex-col gap-6`}>
              <div>
                <p className="mb-3 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">История визитов</p>
                <h2 className="font-display text-4xl font-light md:text-5xl">Ваши визиты</h2>
              </div>

              {history.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {history.map((item, index) => (
                    <article key={`${item.date}-${item.service}-${index}`} className="border border-border bg-background/70 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className={labelClassName}>{formatVisitDate(item.date)}</p>
                          <p className="mt-3 font-display text-3xl font-light text-foreground">{item.service}</p>
                        </div>
                      </div>
                      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">{item.result}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="border border-border bg-background/70 p-6">
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    После первого визита в Hunter здесь появятся завершённые записи и заметки по обслуживанию.
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className={`${panelClassName} flex flex-col gap-6`}>
              <div>
                <p className="mb-4 font-body text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Вход и регистрация</p>
                <h2 className="font-display text-4xl font-light md:text-5xl">Войдите в кабинет</h2>
                <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-muted-foreground">
                  После входа вы сможете видеть будущие записи, историю визитов и персональные условия в Hunter.
                </p>
              </div>

              <button type="button" onClick={startGoogleLogin} className={`${primaryButtonClassName} w-full justify-center`}>
                <Chrome className="mr-3 h-4 w-4" />
                Продолжить через Google
              </button>
            </section>

            <section className={`${panelClassName} flex flex-col gap-5`}>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background/70">
                  <UserRound className="h-7 w-7 text-foreground" />
                </div>
                <div>
                  <p className={labelClassName}>Hunter Account</p>
                  <p className="mt-2 font-display text-3xl font-light text-foreground">Премиальный кабинет клиента</p>
                </div>
              </div>

              <div className="border border-border bg-background/70 p-5">
                <p className={labelClassName}>Что будет внутри</p>
                <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-muted-foreground">
                  <li>Будущие записи и даты следующего визита.</li>
                  <li>История обслуживания и собранный профиль клиента.</li>
                  <li>Статус, бонусы и персональные предложения Hunter.</li>
                </ul>
              </div>

              <div className="border border-border bg-background/70 p-5">
                <p className={labelClassName}>Как работает Google-вход</p>
                <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
                  Вход и регистрация на сайте выполняются только через Google-аккаунт. После первого входа Hunter
                  запомнит ваш кабинет и в следующий раз повторная регистрация уже не понадобится.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default AccountPage;
