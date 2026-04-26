"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/app/admin/adminFetch";
import AdminFilterSelect from "@/app/admin/AdminFilterSelect";
import {
  adminControlStyle,
  adminFormGridStyle,
  adminLabelStyle,
  adminLabelTextStyle,
  adminPrimaryButtonStyle,
} from "@/app/admin/adminFormStyles";
import { adminColors, adminTextStyles } from "@/app/admin/adminTheme";

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
};

const bookingButtonWidth = 236;

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
      const response = await adminFetch("/api/bookings", {
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
        border: `1px solid ${adminColors.border}`,
        background: adminColors.panel,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={adminTextStyles.eyebrow}>Действие CRM</p>
        <h2 style={{ ...adminTextStyles.title, margin: "10px 0 8px" }}>Создать запись</h2>
        <p style={{ ...adminTextStyles.bodyMuted, margin: 0 }}>
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
          style={adminFormGridStyle}
        >
          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Клиент</span>
            <AdminFilterSelect
              name="clientId"
              value=""
              ariaLabel="Клиент"
              options={[
                { value: "", label: "Выберите клиента" },
                ...clients.map((client) => ({
                  value: client.id,
                  label: `${client.first_name} ${client.last_name ?? ""} · ${client.phone}`.trim(),
                })),
              ]}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Услуга</span>
            <AdminFilterSelect
              name="serviceId"
              value=""
              ariaLabel="Услуга"
              options={[
                { value: "", label: "Выберите услугу" },
                ...services.map((service) => ({
                  value: service.id,
                  label: `${service.name} · ${service.duration_min} мин`,
                })),
              ]}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Дата</span>
            <input type="date" name="date" required style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Время</span>
            <input type="time" name="time" required style={adminControlStyle} />
          </label>
        </div>

        <label style={adminLabelStyle}>
          <span style={adminLabelTextStyle}>Заметки</span>
          <textarea name="notes" rows={4} style={{ ...adminControlStyle, resize: "vertical" }} />
        </label>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, flexWrap: "wrap" }}>
          {error ? <span style={{ color: adminColors.danger }}>{error}</span> : null}
          {success ? <span style={{ color: adminColors.success }}>{success}</span> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...adminPrimaryButtonStyle,
              width: bookingButtonWidth,
              justifyContent: "center",
              display: "inline-flex",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting ? "Создаём..." : "Создать запись"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateBookingForm;
