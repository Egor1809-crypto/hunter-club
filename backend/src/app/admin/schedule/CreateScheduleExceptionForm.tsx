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

const CreateScheduleExceptionForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDayOff, setIsDayOff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      exceptionDate: String(formData.get("exceptionDate") ?? ""),
      isDayOff,
      startTime: isDayOff ? null : String(formData.get("startTime") ?? "") || null,
      endTime: isDayOff ? null : String(formData.get("endTime") ?? "") || null,
      reason: String(formData.get("reason") ?? "").trim() || null,
    };

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось создать исключение расписания");
      }

      setSuccess("Исключение добавлено");
      const form = document.getElementById("create-schedule-exception-form") as HTMLFormElement | null;
      form?.reset();
      setIsDayOff(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Не удалось создать исключение расписания",
      );
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
        <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 8px" }}>Добавить исключение</h2>
        <p style={{ color: "#a1a1aa", lineHeight: 1.7, margin: 0 }}>
          Отметьте выходной день или задайте особый график на конкретную дату.
        </p>
      </div>

      <form
        id="create-schedule-exception-form"
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
            <input type="date" name="exceptionDate" required style={inputStyle} />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#d4d4d8",
              fontSize: 14,
              alignSelf: "end",
              minHeight: 48,
            }}
          >
            <input
              type="checkbox"
              name="isDayOff"
              checked={isDayOff}
              onChange={(event) => setIsDayOff(event.target.checked)}
            />
            Полный выходной
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Начало
            </span>
            <input type="time" name="startTime" disabled={isDayOff} style={inputStyle} />
          </label>

          <label style={labelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Конец
            </span>
            <input type="time" name="endTime" disabled={isDayOff} style={inputStyle} />
          </label>
        </div>

        <label style={labelStyle}>
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
            Причина
          </span>
          <textarea name="reason" rows={4} style={{ ...inputStyle, resize: "vertical" }} />
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
            {isSubmitting ? "Сохраняем..." : "Добавить исключение"}
          </button>

          {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
          {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}
        </div>
      </form>
    </section>
  );
};

export default CreateScheduleExceptionForm;
