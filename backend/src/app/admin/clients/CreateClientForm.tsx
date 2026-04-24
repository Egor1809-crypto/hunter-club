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
import { adminColors, adminTextStyles } from "@/app/admin/adminTheme";

const clientButtonWidth = 236;

const CreateClientForm = () => {
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
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось создать клиента");
      }

      setSuccess("Клиент создан");
      const form = document.getElementById("create-client-form") as HTMLFormElement | null;
      form?.reset();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось создать клиента");
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
        <h2 style={{ ...adminTextStyles.title, margin: "10px 0 8px" }}>Создать клиента</h2>
        <p style={{ ...adminTextStyles.bodyMuted, margin: 0 }}>Добавьте нового клиента прямо в базу данных.</p>
      </div>

      <form
        id="create-client-form"
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
            <input name="firstName" required style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Фамилия</span>
            <input name="lastName" style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Телефон</span>
            <input name="phone" required style={adminControlStyle} />
          </label>
        </div>

        <label style={adminLabelStyle}>
          <span style={adminLabelTextStyle}>Заметки</span>
          <textarea name="notes" rows={4} style={{ ...adminControlStyle, resize: "vertical" }} />
        </label>

        <label
          style={{
            display: "inline-grid",
            gridTemplateColumns: "18px max-content",
            alignItems: "center",
            justifySelf: "start",
            gap: 12,
            color: adminColors.textSoft,
            fontSize: 16,
            minHeight: 56,
            boxSizing: "border-box",
            border: `1px solid ${adminColors.border}`,
            background: adminColors.panelStrong,
            padding: "0 16px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            name="isVip"
            style={{
              width: 14,
              height: 14,
              accentColor: adminColors.text,
              margin: 0,
              cursor: "pointer",
            }}
          />
          Отметить как VIP
        </label>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, flexWrap: "wrap" }}>
          {error ? <span style={{ color: adminColors.danger }}>{error}</span> : null}
          {success ? <span style={{ color: adminColors.success }}>{success}</span> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...adminPrimaryButtonStyle,
              width: clientButtonWidth,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting ? "Создаём..." : "Создать клиента"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateClientForm;
