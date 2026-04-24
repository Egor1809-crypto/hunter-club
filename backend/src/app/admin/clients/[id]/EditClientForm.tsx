"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminControlStyle,
  adminFormGridStyle,
  adminLabelStyle,
  adminLabelTextStyle,
  adminPrimaryButtonStyle,
} from "@/app/admin/adminFormStyles";

const EditClientForm = ({
  client,
}: {
  client: {
    id: string;
    first_name: string;
    last_name: string | null;
    phone: string;
    notes: string | null;
    is_vip: boolean;
  };
}) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim(),
      notes: String(formData.get("notes") ?? "").trim() || null,
      isVip: formData.get("isVip") === "on",
    };

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось обновить клиента");
      }

      setSuccess("Изменения сохранены");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось обновить клиента");
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
          Карточка клиента
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 8px" }}>Редактировать клиента</h2>
        <p style={{ color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
          Обновите имя, телефон, заметки и VIP-статус клиента.
        </p>
      </div>

      <form
        action={async (formData) => {
          await handleSubmit(formData);
        }}
        style={{ display: "grid", gap: 16 }}
      >
        <div
          style={adminFormGridStyle}
        >
          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Имя</span>
            <input name="firstName" defaultValue={client.first_name} required style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Фамилия</span>
            <input name="lastName" defaultValue={client.last_name ?? ""} style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Телефон</span>
            <input name="phone" defaultValue={client.phone} required style={adminControlStyle} />
          </label>
        </div>

        <label style={adminLabelStyle}>
          <span style={adminLabelTextStyle}>Заметки</span>
          <textarea name="notes" rows={5} defaultValue={client.notes ?? ""} style={{ ...adminControlStyle, resize: "vertical" }} />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#d4d4d8",
            fontSize: 16,
          }}
        >
          <input type="checkbox" name="isVip" defaultChecked={client.is_vip} />
          VIP-клиент
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...adminPrimaryButtonStyle,
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

export default EditClientForm;
