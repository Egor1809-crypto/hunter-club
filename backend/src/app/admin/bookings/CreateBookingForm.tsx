"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ClientOption = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string;
};

type ServiceOption = {
  id: string;
  name: string;
  duration_min: number;
  price: unknown;
};

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

const CreateBookingForm = ({
  clients,
  services,
}: {
  clients: ClientOption[];
  services: ServiceOption[];
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const date = String(formData.get("date") ?? "");
    const time = String(formData.get("time") ?? "");

    const payload = {
      clientId: String(formData.get("clientId") ?? ""),
      serviceId: String(formData.get("serviceId") ?? ""),
      scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
      source: "admin",
      notes: String(formData.get("notes") ?? "").trim() || null,
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось создать запись");
      }

      setSuccess("Запись создана");
      const form = document.getElementById("create-booking-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось создать запись");
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
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
          Действие CRM
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 8px" }}>Создать запись</h2>
        <p style={{ color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
          Создайте новую запись из админки, используя живых клиентов и услуги.
        </p>
      </div>

      <form
        id="create-booking-form"
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
              Клиент
            </span>
            <select name="clientId" required defaultValue="" style={inputStyle}>
              <option value="" disabled>
                Выберите клиента
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name ?? ""} · {client.phone}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Услуга
            </span>
            <select name="serviceId" required defaultValue="" style={inputStyle}>
              <option value="" disabled>
                Выберите услугу
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} · {service.duration_min} мин
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Дата
            </span>
            <input type="date" name="date" required style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Время
            </span>
            <input type="time" name="time" required style={inputStyle} />
          </label>
        </div>

        <label style={labelStyle}>
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
            Заметки
          </span>
          <textarea name="notes" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
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
            {isSubmitting ? "Создаём..." : "Создать запись"}
          </button>

          {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
          {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}
        </div>
      </form>
    </section>
  );
};

export default CreateBookingForm;
