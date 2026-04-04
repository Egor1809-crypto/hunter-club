"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 8px" }}>Создать клиента</h2>
        <p style={{ color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
          Добавьте нового клиента прямо в базу данных.
        </p>
      </div>

      <form
        id="create-client-form"
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
              Имя
            </span>
            <input name="firstName" required style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Фамилия
            </span>
            <input name="lastName" style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Телефон
            </span>
            <input name="phone" required style={inputStyle} />
          </label>
        </div>

        <label style={labelStyle}>
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
            Заметки
          </span>
          <textarea name="notes" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#d4d4d8",
            fontSize: 14,
          }}
        >
          <input type="checkbox" name="isVip" />
          Отметить как VIP
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
            {isSubmitting ? "Создаём..." : "Создать клиента"}
          </button>

          {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
          {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}
        </div>
      </form>
    </section>
  );
};

export default CreateClientForm;
