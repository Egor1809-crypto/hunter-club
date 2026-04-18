const STORAGE_KEYS = {
  selectedService: "hunter_mobile_selected_service",
  appointments: "hunter_mobile_appointments",
  reviews: "hunter_mobile_reviews",
};

const SERVICES = {
  haircut: { id: "haircut", name: "Стрижка", duration: "60 мин", price: "По запросу", short: "Точность, а не скорость." },
  beard: { id: "beard", name: "Борода", duration: "30 мин", price: "По запросу", short: "Моделирование и уход за бородой." },
  shave: { id: "shave", name: "Бритьё опасной бритвой", duration: "45 мин", price: "По запросу", short: "Королевское бритьё опасной бритвой." },
  combo: { id: "combo", name: "Стрижка + борода", duration: "90 мин", price: "По запросу", short: "Комплекс: стрижка и моделирование бороды." },
  dawn: { id: "dawn", name: "Охота на рассвете", duration: "120 мин", price: "По запросу", short: "VIP-формат с первыми лучами солнца." },
};

const DEFAULT_SERVICE_ID = "haircut";
const MANIFESTO_PARAGRAPHS = [
  "Современный мир — это джунгли высокой плотности. Законы изменились, но инстинкты остались прежними. Сегодня мы не выслеживаем добычу в тайге. Мы ведем сложные переговоры, строим архитектуру бизнеса, выигрываем суды и принимаем решения, от которых зависят судьбы компаний. Каждый день — это охота.",
  "Успех охотника зависит не от количества суетливых движений, а от его выдержки, холодного расчета и абсолютной концентрации. Но чтобы сохранять эту остроту, хищнику нужна территория тишины. Базовый лагерь, где можно снять броню, отсечь информационный шум и перезарядиться.",
  "Барбершоп Hunter создавался именно как такое пространство. Мы не просто стрижем. Мы возвращаем ясность.",
  "Мы верим в непреложный закон формы и содержания: небрежность порождает хаос. И наоборот — безупречный, выверенный до миллиметра срез становится точкой опоры. Ритуал ухода за собой — это процесс отсечения лишнего.",
  "Порядок на голове — это фундамент порядка в голове.",
  "Когда мастер выключает машинку и вы смотрите в зеркало, вы видите не просто идеальный контур. Вы чувствуете структуру. Хаос уступает место системе. Ум становится холодным, а фокус — бритвенно-острым.",
  "Вы снова готовы к охоте.",
];
const SERVICE_DETAILS = {
  haircut: [
    "Стрижка Hunter — это точность формы, которая подчёркивает характер, а не спорит с ним.",
    "Мы начинаем с короткой консультации, чтобы понять, какой образ будет работать в жизни, а не только в зеркале.",
    "Линии выстраиваются чисто, переходы — мягко, а итог выглядит дорого и уверенно.",
    "Это стрижка для тех, кто привык к безупречному результату без лишних слов.",
    "Вышел — и сразу готов на встречу, в город и на свою охоту.",
  ],
  beard: [
    "Борода Hunter — это не просто форма, а точный мужской акцент.",
    "Мы выстраиваем контур, плотность и баланс, чтобы борода усиливала черты лица.",
    "Каждый штрих работает на чистый силуэт, ухоженный вид и ощущение статуса.",
    "В уходе важны комфорт, аккуратность и стойкий результат, который держит форму дольше.",
    "Это тот самый финальный штрих, после которого образ звучит глубже.",
  ],
  shave: [
    "Бритьё опасной бритвой — это классический ритуал в премиальном исполнении.",
    "Горячее полотенце, подготовка кожи и уверенное движение бритвы превращают процедуру в чистое удовольствие.",
    "Мы работаем максимально деликатно, чтобы кожа осталась гладкой, свежей и спокойной.",
    "Такое бритьё даёт не только безупречный результат, но и особое чувство собранности.",
    "Это выбор для тех, кто ценит традицию, точность и настоящий мужской сервис.",
  ],
  combo: [
    "Стрижка + борода — это цельный образ, собранный в одной процедуре.",
    "Мы связываем форму волос и линию бороды так, чтобы всё выглядело гармонично и дорого.",
    "Сначала задаём архитектуру стрижки, затем доводим бороду до безупречного баланса.",
    "В результате вы получаете не две услуги, а один сильный образ без случайных деталей.",
    "Именно так выглядит готовность к любому выходу — уверенно, чисто и по делу.",
  ],
  dawn: [
    "Охота на рассвете — фирменный ритуал Hunter для тех, кто начинает день раньше других.",
    "Это не просто услуга, а атмосферный старт, который собирает мысли и настраивает на результат.",
    "Свежесть, точность и ощущение внутреннего азарта делают образ особенно энергичным.",
    "Такой формат выбирают мужчины, для которых утро — это время силы, а не спешки.",
    "На охоту с охотой — и с видом, который уже говорит за вас.",
  ],
};

const DEFAULT_REVIEWS = [
  {
    id: "review-1",
    name: "Артем",
    service: "Стрижка + борода",
    rating: 5,
    message: "Сильный сервис и очень аккуратная форма. После визита образ собранный и уверенный.",
    createdAt: Date.now() - 300000,
  },
  {
    id: "review-2",
    name: "Илья",
    service: "Бритье опасной бритвой",
    rating: 5,
    message: "Отдельный ритуал. Все спокойно, точно и без суеты. Кожа после бритья в отличном состоянии.",
    createdAt: Date.now() - 200000,
  },
  {
    id: "review-3",
    name: "Константин",
    service: "Охота на рассвете",
    rating: 5,
    message: "Утренний слот задал тон на весь день. Точная работа и приятная атмосфера.",
    createdAt: Date.now() - 100000,
  },
];

const readSelectedService = () => localStorage.getItem(STORAGE_KEYS.selectedService) || DEFAULT_SERVICE_ID;
const saveSelectedService = (serviceId) => localStorage.setItem(STORAGE_KEYS.selectedService, serviceId);

const readAppointments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.appointments);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAppointments = (appointments) => {
  localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
};

const readReviews = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveReviews = (reviews) => {
  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
};

const seedReviews = () => {
  if (readReviews().length) return;
  saveReviews(DEFAULT_REVIEWS);
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const seedAppointments = () => {
  if (readAppointments().length) return;
  saveAppointments([
    {
      id: "seed-1",
      serviceId: "haircut",
      serviceName: "Стрижка",
      dateLabel: "20 мая 2025",
      time: "14:00",
      barber: "Слава",
      duration: "60 мин",
      status: "Подтверждено",
      statusTone: "confirmed",
      phone: "+7 (999) 123-45-67",
      customerName: "Алексей Борисов",
      createdAt: Date.now() - 100000,
    },
    {
      id: "seed-2",
      serviceId: "combo",
      serviceName: "Стрижка + борода",
      dateLabel: "3 июня 2025",
      time: "11:00",
      barber: "Слава",
      duration: "90 мин",
      status: "Ожидание",
      statusTone: "pending",
      phone: "+7 (999) 123-45-67",
      customerName: "Алексей Борисов",
      createdAt: Date.now() - 50000,
    },
  ]);
};

const setButtonActive = (button, active) => {
  if (active) {
    button.style.background = "#fff";
    button.style.borderColor = "#fff";
    button.style.color = "#000";
    button.querySelectorAll("span, p").forEach((node) => {
      node.style.color = "#000";
    });
  } else {
    button.style.background = "transparent";
    button.style.borderColor = "rgba(255,255,255,0.2)";
    button.style.color = "#fff";
    button.querySelectorAll("span, p").forEach((node) => {
      node.style.color = "rgba(255,255,255,0.65)";
    });
  }
};

const ensureGenericModal = ({ key, title, eyebrow, bodyHtml }) => {
  const selector = `[data-generic-modal="${key}"]`;
  const existing = document.querySelector(selector);
  if (existing) return existing;

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-generic-modal", key);
  wrapper.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "padding:24px",
    "background:rgba(13,13,13,0.82)",
    "backdrop-filter:blur(8px)",
    "z-index:130",
  ].join(";");

  wrapper.innerHTML = `
    <div data-close-generic="${key}" style="position:absolute;inset:0;"></div>
    <div style="position:relative;width:min(100%, 420px);max-height:min(82vh, 760px);overflow:auto;border:1px solid rgba(255,255,255,0.12);background:#111;padding:22px 18px 18px;box-shadow:0 24px 80px rgba(0,0,0,0.45);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;">
        <div>
          <p style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-bottom:10px;">${eyebrow}</p>
          <p style="font-family:'Cormorant Garamond', Georgia, serif;font-size:32px;line-height:0.95;font-weight:300;color:#fff;">${title}</p>
        </div>
        <button data-close-generic="${key}" style="width:32px;height:32px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.55);cursor:pointer;">✕</button>
      </div>
      <div>${bodyHtml}</div>
    </div>
  `;

  document.body.appendChild(wrapper);
  return wrapper;
};

const ensureAuthModal = () => {
  if (document.querySelector("[data-auth-modal]")) {
    return document.querySelector("[data-auth-modal]");
  }

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-auth-modal", "true");
  wrapper.style.cssText = [
    "position:fixed",
    "inset:0",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "padding:24px",
    "background:rgba(13,13,13,0.78)",
    "backdrop-filter:blur(6px)",
    "z-index:120",
  ].join(";");

  wrapper.innerHTML = `
    <div data-auth-backdrop="true" style="position:absolute;inset:0;"></div>
    <div style="position:relative;width:min(100%, 360px);border:1px solid rgba(255,255,255,0.12);background:#111;padding:22px 18px 18px;box-shadow:0 24px 80px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;">
        <div>
          <p style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.28);margin-bottom:10px;">Вход и регистрация</p>
          <p style="font-family:'Cormorant Garamond', Georgia, serif;font-size:32px;line-height:0.95;font-weight:300;color:#fff;">Личный кабинет</p>
        </div>
        <button data-close-auth="true" style="width:32px;height:32px;border:1px solid rgba(255,255,255,0.12);background:transparent;color:rgba(255,255,255,0.55);cursor:pointer;">✕</button>
      </div>
      <div style="display:grid;gap:10px;">
        <button data-auth-option="google" style="display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);padding:14px 16px;text-align:left;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12z"/>
              <path fill="#34A853" d="M12 22c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.3-4H3.5v2.5A10 10 0 0 0 12 22z"/>
              <path fill="#4A90E2" d="M6.7 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.5A10 10 0 0 0 2 12c0 1.6.4 3.1 1.5 4.5L6.7 14z"/>
              <path fill="#FBBC05" d="M12 6.1c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 3.1 14.6 2 12 2A10 10 0 0 0 3.5 7.5L6.7 10c.7-2.3 2.8-3.9 5.3-3.9z"/>
            </svg>
            <div>
              <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin-bottom:4px;">Через Google</p>
              <p style="font-size:11px;line-height:1.45;color:rgba(255,255,255,0.38);">Быстрый вход в кабинет через Google-аккаунт</p>
            </div>
          </div>
          <span style="font-size:14px;color:rgba(255,255,255,0.35);">›</span>
        </button>
        <button data-auth-option="phone" style="display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);padding:14px 16px;text-align:left;cursor:pointer;">
          <div style="display:flex;align-items:center;gap:12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <div>
              <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin-bottom:4px;">По телефону</p>
              <p style="font-size:11px;line-height:1.45;color:rgba(255,255,255,0.38);">Вход и регистрация по номеру телефона</p>
            </div>
          </div>
          <span style="font-size:14px;color:rgba(255,255,255,0.35);">›</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);
  return wrapper;
};

const ensureManifestoModal = () =>
  ensureGenericModal({
    key: "manifesto",
    eyebrow: "Философия Hunter",
    title: "Читать манифест",
    bodyHtml: `
      <p style="font-size:13px;line-height:1.65;color:rgba(255,255,255,0.42);margin-bottom:18px;">Территория тишины, ясности и холодного фокуса посреди плотных городских джунглей.</p>
      <div style="display:grid;gap:16px;">
        ${MANIFESTO_PARAGRAPHS.map((paragraph, index) => `
          <p style="${
            index === MANIFESTO_PARAGRAPHS.length - 1 || index === 4
              ? "font-family:'Cormorant Garamond', Georgia, serif;font-size:30px;line-height:0.98;font-weight:300;color:#fff;"
              : "font-size:13px;line-height:1.7;color:rgba(255,255,255,0.55);"
          }">${paragraph}</p>
        `).join("")}
      </div>
    `,
  });

const ensureNotificationsModal = () =>
  ensureGenericModal({
    key: "notifications",
    eyebrow: "Уведомления",
    title: "Что нового",
    bodyHtml: `
      <div style="display:grid;gap:12px;">
        <div style="border:1px solid rgba(255,255,255,0.1);padding:14px 14px;">
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Напоминание</p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.56);">За день до визита приложение будет напоминать о записи и времени визита.</p>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.1);padding:14px 14px;">
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Охота на рассвете</p>
          <p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.56);">Утренние слоты открываются заранее. Следи за появлением свободного времени в записи.</p>
        </div>
      </div>
    `,
  });

const ensureSettingsModal = () =>
  ensureGenericModal({
    key: "settings",
    eyebrow: "Настройки",
    title: "Личный кабинет",
    bodyHtml: `
      <div style="display:grid;gap:10px;">
        <button style="text-align:left;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:14px 16px;cursor:pointer;">
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin-bottom:6px;">Уведомления</p>
          <p style="font-size:12px;line-height:1.5;color:rgba(255,255,255,0.4);">Напоминания о визите и новости Hunter.</p>
        </button>
        <button style="text-align:left;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);padding:14px 16px;cursor:pointer;">
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin-bottom:6px;">Профиль</p>
          <p style="font-size:12px;line-height:1.5;color:rgba(255,255,255,0.4);">Имя, телефон и история ваших записей.</p>
        </button>
      </div>
    `,
  });

const ensureMapStubModal = () =>
  ensureGenericModal({
    key: "map-stub",
    eyebrow: "Карты",
    title: "Открыть в картах",
    bodyHtml: `
      <div style="display:grid;gap:12px;">
        <div style="border:1px solid rgba(255,255,255,0.1);padding:16px;background:rgba(255,255,255,0.02);">
          <p style="font-size:12px;line-height:1.65;color:rgba(255,255,255,0.56);margin-bottom:8px;">Здесь будет открываться карта барбершопа с маршрутом и точкой Hunter.</p>
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.34);">Временная заглушка для мобильного прототипа</p>
        </div>
        <div style="border:1px solid rgba(255,255,255,0.08);padding:14px;">
          <p style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:8px;">Адрес</p>
          <p style="font-size:13px;line-height:1.6;color:#fff;">г. Саратов, Сакко и Ванцетти, 14 корпус 1</p>
        </div>
      </div>
    `,
  });

const wireAuthModal = () => {
  const modal = ensureAuthModal();

  const openModal = () => {
    modal.style.display = "flex";
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  document.querySelectorAll("[data-open-auth]").forEach((button) => {
    button.addEventListener("click", openModal);
  });

  modal.querySelectorAll("[data-close-auth], [data-auth-backdrop]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.querySelector('[data-auth-option="google"]')?.addEventListener("click", () => {
    window.location.href = "mobile-appointments.html?method=google";
  });

  modal.querySelector('[data-auth-option="phone"]')?.addEventListener("click", () => {
    window.location.href = "mobile-appointments.html?method=phone";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
};

const wireGenericModals = () => {
  const manifestoModal = ensureManifestoModal();
  const notificationsModal = ensureNotificationsModal();
  const settingsModal = ensureSettingsModal();
  const mapStubModal = ensureMapStubModal();

  const openModal = (modal) => {
    modal.style.display = "flex";
  };
  const closeModal = (modal) => {
    modal.style.display = "none";
  };

  document.querySelectorAll("[data-open-manifesto]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(manifestoModal);
    });
  });

  document.querySelectorAll("[data-open-notifications]").forEach((button) => {
    button.addEventListener("click", () => openModal(notificationsModal));
  });

  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => openModal(settingsModal));
  });

  document.querySelectorAll("[data-open-map-stub]").forEach((button) => {
    button.addEventListener("click", () => openModal(mapStubModal));
  });

  [manifestoModal, notificationsModal, settingsModal, mapStubModal].forEach((modal) => {
    modal.querySelectorAll("[data-close-generic]").forEach((button) => {
      button.addEventListener("click", () => closeModal(modal));
    });
  });
};

const wireMapPreview = () => {
  const toggle = document.querySelector("[data-map-preview-toggle]");
  const card = document.querySelector("[data-map-preview-card]");

  if (!toggle || !card) return;

  const closePreview = () => {
    card.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextState = !card.classList.contains("is-open");
    card.classList.toggle("is-open", nextState);
    toggle.setAttribute("aria-expanded", nextState ? "true" : "false");
  });

  card.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", closePreview);
};

const wireNav = () => {
  document.querySelectorAll("[data-nav-target]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = button.getAttribute("data-nav-target");
    });
  });

  document.querySelectorAll("[data-back-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-back-target");
      if (target) {
        window.location.href = target;
      } else if (window.history.length > 1) {
        window.history.back();
      }
    });
  });
};

const initHome = () => {
  document.querySelectorAll("[data-service-option]").forEach((button) => {
    const serviceId = button.getAttribute("data-service-option");
    setButtonActive(button, false);

    button.addEventListener("click", () => {
      saveSelectedService(serviceId);
      document.querySelectorAll("[data-service-option]").forEach((item) => {
        setButtonActive(item, item.getAttribute("data-service-option") === serviceId);
      });
    });
  });

  const findTimeButton = document.querySelector("[data-find-time]");
  if (findTimeButton) {
    findTimeButton.addEventListener("click", () => {
      window.location.href = "mobile-booking.html";
    });
  }
};

const initServices = () => {
  document.querySelectorAll("[data-service-card]").forEach((card) => {
    const serviceId = card.getAttribute("data-service-card");
    const details = card.querySelector("[data-service-details]");
    const arrow = card.querySelector("[data-service-arrow]");
    const summary = card.querySelector("[data-service-summary]");
    card.style.background = "transparent";

    summary?.addEventListener("click", () => {
      saveSelectedService(serviceId);
      const isOpen = details?.style.display === "block";
      document.querySelectorAll("[data-service-details]").forEach((node) => {
        node.style.display = "none";
      });
      document.querySelectorAll("[data-service-arrow]").forEach((node) => {
        node.style.transform = "rotate(0deg)";
      });
      if (!isOpen && details) {
        details.style.display = "block";
        if (arrow) arrow.style.transform = "rotate(90deg)";
      }
    });
  });
};

const initBooking = () => {
  const selectedService = SERVICES[readSelectedService()] || SERVICES[DEFAULT_SERVICE_ID];
  const titleNode = document.querySelector("[data-selected-service-name]");
  const metaNode = document.querySelector("[data-selected-service-meta]");
  const durationNode = document.querySelector("[data-selected-service-duration]");

  if (titleNode) titleNode.textContent = selectedService.name;
  if (metaNode) metaNode.textContent = selectedService.price;
  if (durationNode) durationNode.textContent = selectedService.duration;

  let selectedDateLabel = "";
  let selectedTime = "";

  document.querySelectorAll("[data-date-button]").forEach((button) => {
    if (button.getAttribute("data-default") === "true") {
      selectedDateLabel = button.getAttribute("data-date-label");
    }

    button.addEventListener("click", () => {
      document.querySelectorAll("[data-date-button]").forEach((item) => {
        item.style.background = "none";
        item.style.color = "rgba(255,255,255,0.6)";
        item.style.border = "none";
      });
      button.style.background = "#fff";
      button.style.color = "#000";
      button.style.border = "none";
      selectedDateLabel = button.getAttribute("data-date-label");
    });
  });

  document.querySelectorAll("[data-time-slot]").forEach((button) => {
    const unavailable = button.getAttribute("data-unavailable") === "true";
    if (button.getAttribute("data-default") === "true" && !unavailable) {
      selectedTime = button.getAttribute("data-time-slot");
    }

    button.addEventListener("click", () => {
      if (unavailable) return;

      document.querySelectorAll("[data-time-slot]").forEach((item) => {
        if (item.getAttribute("data-unavailable") === "true") return;
        item.classList.remove("selected");
        item.style.background = "transparent";
        item.style.borderColor = "rgba(255,255,255,0.2)";
        item.querySelectorAll("span").forEach((node) => {
          node.style.color = "rgba(255,255,255,0.6)";
        });
      });

      button.classList.add("selected");
      button.style.background = "#fff";
      button.style.borderColor = "#fff";
      button.querySelectorAll("span").forEach((node) => {
        node.style.color = "#000";
      });
      selectedTime = button.getAttribute("data-time-slot");
    });
  });

  const confirmButton = document.querySelector("[data-confirm-booking]");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      const phone = document.querySelector("[data-booking-phone]")?.value?.trim() || "+7 (999) 123-45-67";
      const customerName = document.querySelector("[data-booking-name]")?.value?.trim() || "Гость Hunter";
      const appointments = readAppointments();

      const newAppointment = {
        id: `appt-${Date.now()}`,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        dateLabel: selectedDateLabel || "22 мая 2025",
        time: selectedTime || "14:00",
        barber: "Слава",
        duration: selectedService.duration,
        status: "Ожидание",
        statusTone: "pending",
        phone,
        customerName,
        createdAt: Date.now(),
      };

      appointments.unshift(newAppointment);
      saveAppointments(appointments);
      window.location.href = "mobile-appointments.html";
    });
  }
};

const appointmentStatusMarkup = (appointment) => {
  const tone = appointment.statusTone === "confirmed"
    ? "border:1px solid rgba(255,255,255,0.3);color:rgba(255,255,255,0.6);"
    : "border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.35);";

  return `
    <span style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:4px 8px;${tone}">${appointment.status}</span>
  `;
};

const initAppointments = () => {
  seedAppointments();
  const appointments = readAppointments();
  const list = document.querySelector("[data-appointments-list]");
  const profileName = document.querySelector("[data-profile-name]");
  const profilePhone = document.querySelector("[data-profile-phone]");
  const visits = document.querySelector("[data-profile-visits]");

  if (appointments[0]) {
    if (profileName) profileName.textContent = appointments[0].customerName;
    if (profilePhone) profilePhone.textContent = appointments[0].phone;
  }
  if (visits) visits.textContent = `${appointments.length} визита`;

  if (!list) return;
  let currentTab = "upcoming";
  const upcomingTab = document.querySelector('[data-appointments-tab="upcoming"]');
  const completedTab = document.querySelector('[data-appointments-tab="completed"]');

  const renderTabs = () => {
    if (upcomingTab) {
      upcomingTab.style.color = currentTab === "upcoming" ? "#fff" : "rgba(255,255,255,0.3)";
      upcomingTab.style.borderBottom = currentTab === "upcoming" ? "1px solid #fff" : "none";
    }
    if (completedTab) {
      completedTab.style.color = currentTab === "completed" ? "#fff" : "rgba(255,255,255,0.3)";
      completedTab.style.borderBottom = currentTab === "completed" ? "1px solid #fff" : "none";
    }
  };

  const renderAppointments = () => {
    const filteredAppointments = appointments.filter((appointment) =>
      currentTab === "upcoming"
        ? appointment.statusTone !== "cancelled"
        : appointment.statusTone === "cancelled",
    );

    list.innerHTML = filteredAppointments.length
      ? filteredAppointments
        .map((appointment) => {
      const canCancel = appointment.statusTone !== "cancelled";
      return `
        <div style="border-bottom:1px solid rgba(255,255,255,0.08);padding:20px 0;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
            <div style="flex:1;">
              <p class="font-cormorant" style="font-size:18px;font-weight:300;color:#fff;margin-bottom:4px;">${appointment.serviceName}</p>
              <p style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:4px;">${appointment.dateLabel} · ${appointment.time} · ${appointment.barber}</p>
              <p style="font-size:10px;color:rgba(255,255,255,0.25);">${appointment.duration}</p>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;margin-top:4px;">
              ${appointmentStatusMarkup(appointment)}
              ${canCancel ? `<button data-cancel-appointment="${appointment.id}" style="font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);background:none;border:none;text-decoration:underline;text-underline-offset:4px;cursor:pointer;">Отменить</button>` : ""}
            </div>
          </div>
        </div>
      `;
        })
        .join("")
      : `<div style="padding:20px 0;"><p style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.42);">${currentTab === "upcoming" ? "Пока нет предстоящих записей." : "Здесь появятся завершённые или отменённые визиты."}</p></div>`;

    document.querySelectorAll("[data-cancel-appointment]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-cancel-appointment");
        const updated = readAppointments().map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: "Отменено", statusTone: "cancelled" }
            : appointment,
        );
        saveAppointments(updated);
        initAppointments();
      });
    });
  };

  upcomingTab?.addEventListener("click", () => {
    currentTab = "upcoming";
    renderTabs();
    renderAppointments();
  });

  completedTab?.addEventListener("click", () => {
    currentTab = "completed";
    renderTabs();
    renderAppointments();
  });

  renderTabs();
  renderAppointments();
};

const initReviews = () => {
  seedReviews();
  const carousel = document.querySelector("[data-reviews-carousel]");
  const track = document.querySelector("[data-review-track]");
  const form = document.querySelector("[data-review-form]");
  const ratingButtons = document.querySelectorAll("[data-review-rating]");
  const ratingValueNode = document.querySelector("[data-review-rating-value]");
  const emptyNode = document.querySelector("[data-reviews-empty]");
  const serviceNode = document.querySelector("[data-carousel-service]");
  const nameNode = document.querySelector("[data-carousel-name]");
  const starsNode = document.querySelector("[data-carousel-rating]");
  const dateNode = document.querySelector("[data-carousel-date]");
  const messageNode = document.querySelector("[data-carousel-message]");
  const dotsNode = document.querySelector("[data-review-dots]");
  const sortReviews = (items) => [...items].sort((a, b) => b.createdAt - a.createdAt);
  let selectedRating = 5;
  let activeIndex = 0;
  let touchStartX = null;
  let autoplayId = null;

  const updateRatingUI = () => {
    ratingButtons.forEach((button) => {
      const value = Number(button.getAttribute("data-review-rating") || 0);
      const active = value <= selectedRating;
      button.style.color = active ? "#ffffff" : "rgba(255,255,255,0.24)";
      button.style.transform = active ? "translateY(-1px)" : "translateY(0)";
    });

    if (ratingValueNode) {
      ratingValueNode.textContent = `${selectedRating}.0`;
    }
  };

  const formatReviewDate = (timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" });
  };

  const renderDots = (reviews) => {
    if (!dotsNode) return;
    dotsNode.innerHTML = reviews
      .map((_, index) => {
        const active = index === activeIndex;
        return `<button type="button" data-review-dot="${index}" style="width:${active ? 28 : 8}px;height:8px;border:none;border-radius:999px;background:${active ? "#fff" : "rgba(255,255,255,0.24)"};cursor:pointer;transition:all .25s ease;"></button>`;
      })
      .join("");

    dotsNode.querySelectorAll("[data-review-dot]").forEach((button) => {
      button.addEventListener("click", () => {
        activeIndex = Number(button.getAttribute("data-review-dot") || 0);
        renderReviews();
      });
    });
  };

  const renderReviews = () => {
    const reviews = sortReviews(readReviews());
    if (emptyNode) {
      emptyNode.style.display = reviews.length ? "none" : "block";
    }
    if (carousel) {
      carousel.style.display = reviews.length ? "block" : "none";
    }
    if (!reviews.length) {
      return;
    }

    if (activeIndex > reviews.length - 1) {
      activeIndex = 0;
    }

    const activeReview = reviews[activeIndex];
    if (serviceNode) serviceNode.textContent = activeReview.service;
    if (nameNode) nameNode.textContent = activeReview.name;
    if (starsNode) starsNode.textContent = "★★★★★".slice(0, activeReview.rating);
    if (dateNode) dateNode.textContent = formatReviewDate(activeReview.createdAt);
    if (messageNode) messageNode.textContent = activeReview.message;
    renderDots(reviews);
  };

  const stepReviews = (direction) => {
    const reviews = sortReviews(readReviews());
    if (!reviews.length) return;
    activeIndex = (activeIndex + direction + reviews.length) % reviews.length;
    renderReviews();
  };

  const restartAutoplay = () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
    }
    autoplayId = window.setInterval(() => {
      stepReviews(1);
    }, 4500);
  };

  ratingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRating = Number(button.getAttribute("data-review-rating") || 5);
      updateRatingUI();
    });
  });

  updateRatingUI();
  renderReviews();
  restartAutoplay();

  track?.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX ?? null;
  }, { passive: true });

  track?.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;
    touchStartX = null;

    if (Math.abs(deltaX) < 40) return;
    stepReviews(deltaX < 0 ? 1 : -1);
    restartAutoplay();
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameNode = form.querySelector("[data-review-name]");
    const serviceNode = form.querySelector("[data-review-service]");
    const messageNode = form.querySelector("[data-review-message]");
    const name = nameNode?.value?.trim() || "";
    const service = serviceNode?.value?.trim() || "";
    const message = messageNode?.value?.trim() || "";

    if (!name || !service || !message) {
      return;
    }

    const next = sortReviews([
      {
        id: `review-${Date.now()}`,
        name,
        service,
        rating: selectedRating,
        message,
        createdAt: Date.now(),
      },
      ...readReviews(),
    ]);

    saveReviews(next);
    form.reset();
    selectedRating = 5;
    activeIndex = 0;
    updateRatingUI();
    renderReviews();
    restartAutoplay();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireAuthModal();
  wireGenericModals();
  wireMapPreview();

  const page = document.body.getAttribute("data-page");

  if (page === "home") initHome();
  if (page === "services") initServices();
  if (page === "booking") initBooking();
  if (page === "appointments") initAppointments();
  if (page === "reviews") initReviews();
});
