-- ============================================
-- HUNTER Barbershop — PostgreSQL Database Schema
-- ============================================
-- Версия: 1.0.0
-- Описание: Полная схема базы данных для CRM барбершопа Hunter
-- ============================================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. УСЛУГИ (services)
-- ============================================
-- Цены заполняются вручную владельцем.
-- Все зависимости (аналитика, бронирования) подтянут цену отсюда.

CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(50) UNIQUE NOT NULL,          -- 'haircut', 'beard', 'shave', 'dawn_hunt'
    name            VARCHAR(100) NOT NULL,                 -- 'Стрижка', 'Борода', 'Бритьё', 'Охота на рассвете'
    description     TEXT,
    price           NUMERIC(10, 2),                        -- NULL пока не заполнено владельцем
    duration_min    INTEGER NOT NULL DEFAULT 60,           -- длительность в минутах
    is_dawn_hunt    BOOLEAN NOT NULL DEFAULT FALSE,        -- флаг особой утренней услуги
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Предзаполненные услуги (цены = NULL — заполнит владелец)
INSERT INTO services (slug, name, description, duration_min, is_dawn_hunt, sort_order) VALUES
    ('haircut',    'Стрижка',           'Мужская стрижка. Точность, а не скорость.', 60, FALSE, 1),
    ('beard',      'Борода',            'Моделирование и уход за бородой.', 30, FALSE, 2),
    ('shave',      'Бритьё опасной',    'Королевское бритьё опасной бритвой.', 45, FALSE, 3),
    ('haircut_beard', 'Стрижка + борода', 'Комплекс: стрижка и моделирование бороды.', 90, FALSE, 4),
    ('dawn_hunt',  'Охота на рассвете', 'Особая утренняя стрижка (06:00–07:30). Начни день как охотник.', 60, TRUE, 5);


-- ============================================
-- 2. КЛИЕНТЫ (clients)
-- ============================================

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(20) UNIQUE NOT NULL,           -- основной идентификатор (звонок!)
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    notes           TEXT,                                   -- заметки мастера о клиенте
    is_vip          BOOLEAN NOT NULL DEFAULT FALSE,
    total_visits    INTEGER NOT NULL DEFAULT 0,            -- денормализовано для быстрого доступа
    total_spent     NUMERIC(12, 2) NOT NULL DEFAULT 0,    -- денормализовано
    first_visit_at  TIMESTAMPTZ,
    last_visit_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_last_visit ON clients(last_visit_at DESC);


-- ============================================
-- 3. БРОНИРОВАНИЯ / ЗАПИСИ (bookings)
-- ============================================

CREATE TYPE booking_status AS ENUM (
    'scheduled',    -- запланировано
    'confirmed',    -- подтверждено (перезвонили)
    'in_progress',  -- клиент в кресле
    'completed',    -- завершено
    'cancelled',    -- отменено клиентом
    'no_show'       -- не пришёл
);

CREATE TYPE booking_source AS ENUM (
    'phone',        -- основной канал (звонок)
    'walk_in',      -- пришёл без записи
    'website',      -- с сайта (если будет онлайн-запись)
    'admin'         -- записал мастер вручную
);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,

    -- Время
    scheduled_at    TIMESTAMPTZ NOT NULL,                  -- дата и время записи
    duration_min    INTEGER NOT NULL,                       -- копия из услуги на момент записи
    ended_at        TIMESTAMPTZ,                           -- фактическое время окончания

    -- Статус и источник
    status          booking_status NOT NULL DEFAULT 'scheduled',
    source          booking_source NOT NULL DEFAULT 'phone',

    -- Финансы (берём цену на момент записи, чтобы изменение прайса не ломало историю)
    price           NUMERIC(10, 2),                        -- цена на момент записи

    -- Служебное
    is_dawn_hunt    BOOLEAN NOT NULL DEFAULT FALSE,        -- быстрый фильтр по утренним
    notes           TEXT,                                   -- заметки к визиту
    reminder_sent   BOOLEAN NOT NULL DEFAULT FALSE,        -- отправлено ли напоминание

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dawn ON bookings(is_dawn_hunt) WHERE is_dawn_hunt = TRUE;


-- ============================================
-- 4. ПРОГРАММА ЛОЯЛЬНОСТИ (loyalty)
-- ============================================
-- «На охоту с охотой» — без карт, без приложений.
-- Слава знает своих. CRM считает автоматически.

CREATE TABLE loyalty_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,                 -- 'Каждый 5-й визит — бонус'
    description     TEXT,
    visits_required INTEGER NOT NULL,                       -- после скольки визитов срабатывает
    reward_type     VARCHAR(50) NOT NULL,                   -- 'discount_percent', 'discount_fixed', 'free_service'
    reward_value    NUMERIC(10, 2) NOT NULL,               -- 20 (= 20%), 500 (= 500₽), или service_id для free
    reward_service_id UUID REFERENCES services(id),        -- если бонус = бесплатная услуга
    is_recurring    BOOLEAN NOT NULL DEFAULT TRUE,         -- каждые N визитов или только один раз
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Лог начислений бонусов
CREATE TABLE loyalty_rewards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    rule_id         UUID NOT NULL REFERENCES loyalty_rules(id) ON DELETE RESTRICT,
    booking_id      UUID REFERENCES bookings(id),          -- за какой визит начислено
    description     TEXT NOT NULL,
    is_redeemed     BOOLEAN NOT NULL DEFAULT FALSE,        -- использован ли бонус
    redeemed_at     TIMESTAMPTZ,
    redeemed_booking_id UUID REFERENCES bookings(id),      -- при каком визите использован
    expires_at      TIMESTAMPTZ,                           -- срок годности (опционально)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_rewards_client ON loyalty_rewards(client_id);
CREATE INDEX idx_loyalty_rewards_pending ON loyalty_rewards(client_id, is_redeemed) WHERE is_redeemed = FALSE;


-- ============================================
-- 5. SMS / НАПОМИНАНИЯ (notifications)
-- ============================================

CREATE TYPE notification_type AS ENUM (
    'reminder_24h',     -- за 24 часа
    'reminder_2h',      -- за 2 часа
    'loyalty_reward',   -- бонус начислен
    'custom'            -- произвольное
);

CREATE TYPE notification_channel AS ENUM (
    'sms',
    'push'
);

CREATE TYPE notification_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'failed'
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    booking_id      UUID REFERENCES bookings(id),
    type            notification_type NOT NULL,
    channel         notification_channel NOT NULL DEFAULT 'sms',
    status          notification_status NOT NULL DEFAULT 'pending',
    message         TEXT NOT NULL,
    scheduled_for   TIMESTAMPTZ NOT NULL,
    sent_at         TIMESTAMPTZ,
    error_details   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_pending ON notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_client ON notifications(client_id);


-- ============================================
-- 6. РАБОЧИЙ ГРАФИК (schedule)
-- ============================================
-- Расписание мастера. Слоты генерируются на основе этих данных.

CREATE TABLE work_schedule (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Пн, 6=Вс
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_dawn_hunt    BOOLEAN NOT NULL DEFAULT FALSE,        -- утренний слот «Охота на рассвете»
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Исключения (выходные, отпуск, переносы)
CREATE TABLE schedule_exceptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exception_date  DATE NOT NULL UNIQUE,
    is_day_off      BOOLEAN NOT NULL DEFAULT TRUE,         -- TRUE = выходной, FALSE = особый график
    start_time      TIME,                                   -- если не выходной — время начала
    end_time        TIME,                                   -- если не выходной — время конца
    reason          VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Стандартное расписание
INSERT INTO work_schedule (day_of_week, start_time, end_time, is_dawn_hunt) VALUES
    -- Утренняя охота (Пн-Пт)
    (0, '06:00', '07:30', TRUE),
    (1, '06:00', '07:30', TRUE),
    (2, '06:00', '07:30', TRUE),
    (3, '06:00', '07:30', TRUE),
    (4, '06:00', '07:30', TRUE),
    -- Основное время (Пн-Пт)
    (0, '09:00', '20:00', FALSE),
    (1, '09:00', '20:00', FALSE),
    (2, '09:00', '20:00', FALSE),
    (3, '09:00', '20:00', FALSE),
    (4, '09:00', '20:00', FALSE),
    -- Суббота
    (5, '10:00', '18:00', FALSE);
-- Воскресенье = выходной (нет записи)


-- ============================================
-- 7. АНАЛИТИКА — Агрегации (analytics_daily)
-- ============================================
-- Материализованные дневные метрики для быстрых дашбордов.

CREATE TABLE analytics_daily (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_date     DATE NOT NULL UNIQUE,
    total_bookings  INTEGER NOT NULL DEFAULT 0,
    completed       INTEGER NOT NULL DEFAULT 0,
    cancelled       INTEGER NOT NULL DEFAULT 0,
    no_shows        INTEGER NOT NULL DEFAULT 0,
    dawn_hunts      INTEGER NOT NULL DEFAULT 0,
    revenue         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    new_clients     INTEGER NOT NULL DEFAULT 0,
    avg_service_min NUMERIC(6, 2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_date ON analytics_daily(report_date DESC);


-- ============================================
-- 8. ADMIN / AUTH
-- ============================================
-- Минимальная аутентификация для CRM-панели.
-- Один пользователь (Слава), но структура позволяет расширить.

CREATE TABLE admin_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,                 -- bcrypt
    display_name    VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'owner',  -- 'owner', 'admin', 'viewer'
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 9. НАСТРОЙКИ (settings)
-- ============================================
-- Ключ-значение для глобальных настроек.

CREATE TABLE settings (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    description     VARCHAR(255),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 10. ОТЗЫВЫ С САЙТА (reviews)
-- ============================================
-- Посетители оставляют отзывы на сайте, а Слава модерирует их в CRM.

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name   VARCHAR(100) NOT NULL,
    service_label   VARCHAR(100),
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message         TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'new',   -- new, published, archived
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

INSERT INTO settings (key, value, description) VALUES
    ('business_name', '"Hunter"', 'Название барбершопа'),
    ('business_phone', '""', 'Телефон для записи'),
    ('business_address', '"Саратов"', 'Адрес'),
    ('booking_slot_min', '30', 'Минимальный слот записи в минутах'),
    ('reminder_24h_enabled', 'true', 'SMS-напоминание за 24 часа'),
    ('reminder_2h_enabled', 'true', 'SMS-напоминание за 2 часа'),
    ('sms_provider', '"none"', 'Провайдер SMS: none, sms_ru, twilio'),
    ('sms_api_key', '""', 'API ключ SMS-провайдера'),
    ('loyalty_enabled', 'true', 'Программа лояльности включена'),
    ('dawn_hunt_enabled', 'true', 'Охота на рассвете включена');


-- ============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ============================================

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_analytics_updated BEFORE UPDATE ON analytics_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Обновление статистики клиента при завершении визита
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE clients SET
            total_visits = total_visits + 1,
            total_spent = total_spent + COALESCE(NEW.price, 0),
            last_visit_at = NEW.scheduled_at,
            first_visit_at = COALESCE(first_visit_at, NEW.scheduled_at)
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_completed AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();


-- Проверка лояльности при завершении визита
CREATE OR REPLACE FUNCTION check_loyalty_reward()
RETURNS TRIGGER AS $$
DECLARE
    v_visits INTEGER;
    v_rule RECORD;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Получаем актуальное кол-во визитов
        SELECT total_visits INTO v_visits FROM clients WHERE id = NEW.client_id;

        -- Проверяем все активные правила лояльности
        FOR v_rule IN
            SELECT * FROM loyalty_rules WHERE is_active = TRUE
        LOOP
            IF v_visits > 0 AND v_visits % v_rule.visits_required = 0 THEN
                -- Для рекуррентных правил или первого срабатывания
                IF v_rule.is_recurring OR NOT EXISTS (
                    SELECT 1 FROM loyalty_rewards
                    WHERE client_id = NEW.client_id AND rule_id = v_rule.id
                ) THEN
                    INSERT INTO loyalty_rewards (client_id, rule_id, booking_id, description)
                    VALUES (
                        NEW.client_id,
                        v_rule.id,
                        NEW.id,
                        v_rule.name || ' — визит #' || v_visits
                    );
                END IF;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_loyalty AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION check_loyalty_reward();


-- ============================================
-- VIEWS для удобства
-- ============================================

-- Ближайшие записи (сегодня и завтра)
CREATE VIEW v_upcoming_bookings AS
SELECT
    b.id,
    b.scheduled_at,
    b.status,
    b.is_dawn_hunt,
    b.price,
    b.notes,
    b.source,
    c.first_name || ' ' || COALESCE(c.last_name, '') AS client_name,
    c.phone AS client_phone,
    c.total_visits AS client_visits,
    s.name AS service_name,
    s.duration_min
FROM bookings b
JOIN clients c ON c.id = b.client_id
JOIN services s ON s.id = b.service_id
WHERE b.scheduled_at >= CURRENT_DATE
  AND b.scheduled_at < CURRENT_DATE + INTERVAL '2 days'
  AND b.status NOT IN ('cancelled')
ORDER BY b.scheduled_at;


-- Клиенты с активными бонусами
CREATE VIEW v_clients_with_rewards AS
SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.phone,
    c.total_visits,
    c.total_spent,
    COUNT(lr.id) AS pending_rewards
FROM clients c
JOIN loyalty_rewards lr ON lr.client_id = c.id AND lr.is_redeemed = FALSE
    AND (lr.expires_at IS NULL OR lr.expires_at > NOW())
GROUP BY c.id;


-- Месячная аналитика
CREATE VIEW v_monthly_analytics AS
SELECT
    DATE_TRUNC('month', report_date) AS month,
    SUM(total_bookings) AS bookings,
    SUM(completed) AS completed,
    SUM(cancelled) AS cancelled,
    SUM(no_shows) AS no_shows,
    SUM(dawn_hunts) AS dawn_hunts,
    SUM(revenue) AS revenue,
    SUM(new_clients) AS new_clients,
    ROUND(AVG(avg_service_min), 1) AS avg_service_min
FROM analytics_daily
GROUP BY DATE_TRUNC('month', report_date)
ORDER BY month DESC;
