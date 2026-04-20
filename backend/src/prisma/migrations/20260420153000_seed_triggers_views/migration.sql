-- Seed data and database-side helpers that are required for a fresh install
-- to behave like the legacy database/init.sql bootstrap.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO services (slug, name, description, duration_min, is_dawn_hunt, sort_order) VALUES
    ('haircut', 'Стрижка', 'Точность, а не скорость.', 60, FALSE, 1),
    ('beard', 'Борода', 'Моделирование и уход за бородой.', 30, FALSE, 2),
    ('shave', 'Бритьё опасной бритвой', 'Королевское бритьё опасной бритвой.', 45, FALSE, 3),
    ('haircut_beard', 'Стрижка + борода', 'Комплекс: стрижка и моделирование бороды.', 90, FALSE, 4),
    ('dawn_hunt', 'Охота на рассвете', 'Особая утренняя стрижка (06:00–07:30). Начни день как охотник.', 60, TRUE, 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO work_schedule (day_of_week, start_time, end_time, is_dawn_hunt)
SELECT schedule.day_of_week, schedule.start_time, schedule.end_time, schedule.is_dawn_hunt
FROM (
    VALUES
        (0, '06:00'::time, '07:30'::time, TRUE),
        (1, '06:00'::time, '07:30'::time, TRUE),
        (2, '06:00'::time, '07:30'::time, TRUE),
        (3, '06:00'::time, '07:30'::time, TRUE),
        (4, '06:00'::time, '07:30'::time, TRUE),
        (0, '09:00'::time, '20:00'::time, FALSE),
        (1, '09:00'::time, '20:00'::time, FALSE),
        (2, '09:00'::time, '20:00'::time, FALSE),
        (3, '09:00'::time, '20:00'::time, FALSE),
        (4, '09:00'::time, '20:00'::time, FALSE),
        (5, '10:00'::time, '18:00'::time, FALSE)
) AS schedule(day_of_week, start_time, end_time, is_dawn_hunt)
WHERE NOT EXISTS (
    SELECT 1
    FROM work_schedule existing
    WHERE existing.day_of_week = schedule.day_of_week
      AND existing.start_time = schedule.start_time
      AND existing.end_time = schedule.end_time
      AND existing.is_dawn_hunt = schedule.is_dawn_hunt
);

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
    ('dawn_hunt_enabled', 'true', 'Охота на рассвете включена')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_services_updated ON services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_clients_updated ON clients;
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_visitor_accounts_updated ON visitor_accounts;
CREATE TRIGGER trg_visitor_accounts_updated BEFORE UPDATE ON visitor_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_phone_otps_updated ON phone_otps;
CREATE TRIGGER trg_phone_otps_updated BEFORE UPDATE ON phone_otps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_rate_limits_updated ON rate_limits;
CREATE TRIGGER trg_rate_limits_updated BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_analytics_updated ON analytics_daily;
CREATE TRIGGER trg_analytics_updated BEFORE UPDATE ON analytics_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated ON reviews;
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

DROP TRIGGER IF EXISTS trg_booking_completed ON bookings;
CREATE TRIGGER trg_booking_completed AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_client_stats();

CREATE OR REPLACE FUNCTION check_loyalty_reward()
RETURNS TRIGGER AS $$
DECLARE
    v_visits INTEGER;
    v_rule RECORD;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        SELECT total_visits INTO v_visits FROM clients WHERE id = NEW.client_id;

        FOR v_rule IN
            SELECT * FROM loyalty_rules WHERE is_active = TRUE
        LOOP
            IF v_visits > 0 AND v_visits % v_rule.visits_required = 0 THEN
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

DROP TRIGGER IF EXISTS trg_check_loyalty ON bookings;
CREATE TRIGGER trg_check_loyalty AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION check_loyalty_reward();

DROP VIEW IF EXISTS v_upcoming_bookings;
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

DROP VIEW IF EXISTS v_clients_with_rewards;
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

DROP VIEW IF EXISTS v_monthly_analytics;
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
