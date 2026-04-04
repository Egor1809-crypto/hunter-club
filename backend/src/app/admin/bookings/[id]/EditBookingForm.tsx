"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.9)",
  color: "#f5f5f5",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const EditBookingForm = ({
  booking,
}: {
  booking: {
    id: string;
    scheduled_at: Date;
    status: string;
    notes: string | null;
  };
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaults = useMemo(() => {
    const date = new Date(booking.scheduled_at);
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString();

    return {
      date: iso.slice(0, 10),
      time: iso.slice(11, 16),
    };
  }, [booking.scheduled_at]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");

    const payload = {
      scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
      status: String(formData.get("status") ?? ""),
      notes: String(formData.get("notes") ?? "").trim() || null,
    };

    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось обновить запись");
      }

      setSuccess("Изменения сохранены");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось обновить запись");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(18,18,18,0.92)",
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
          Карточка записи
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 8px" }}>Редактировать запись</h2>
        <p style={{ color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
          Обновите дату, время, статус и заметки по визиту.
        </p>
      </div>

      <form
        action={async (formData) => {
          await handleSubmit(formData);
        }}
        style={{ display: "grid", gap: 16 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Дата
            </span>
            <input type="date" name="date" defaultValue={defaults.date} required style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Время
            </span>
            <input type="time" name="time" defaultValue={defaults.time} required style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Статус
            </span>
            <select name="status" defaultValue={booking.status} style={inputStyle}>
              <option value="scheduled">Запланирована</option>
              <option value="confirmed">Подтверждена</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
              <option value="no_show">Не пришёл</option>
            </select>
          </label>
        </div>

        <label style={labelStyle}>
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
            Заметки
          </span>
          <textarea name="notes" rows={5} defaultValue={booking.notes ?? ""} style={{ ...inputStyle, resize: "vertical" }} />
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              border: "none",
              background: "#f5f5f5",
              color: "#09090b",
              padding: "14px 18px",
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting ? "Сохраняем..." : "Сохранить изменения"}
          </button>

          {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
          {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}
        </div>
      </form>
    </section>
  );
};

export default EditBookingForm;
