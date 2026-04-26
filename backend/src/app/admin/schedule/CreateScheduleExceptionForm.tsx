"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFetch } from "@/app/admin/adminFetch";
import {
  adminControlStyle,
  adminFormGridStyle,
  adminLabelStyle,
  adminLabelTextStyle,
  adminPrimaryButtonStyle,
} from "@/app/admin/adminFormStyles";
import { adminColors, adminTextStyles } from "@/app/admin/adminTheme";

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
      const response = await adminFetch("/api/schedule", {
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
        border: `1px solid ${adminColors.border}`,
        background: adminColors.panel,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <p style={adminTextStyles.eyebrow}>Действие CRM</p>
        <h2 style={{ ...adminTextStyles.title, margin: "10px 0 8px" }}>Добавить исключение</h2>
        <p style={{ ...adminTextStyles.bodyMuted, margin: 0 }}>
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
          style={adminFormGridStyle}
        >
          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Дата</span>
            <input type="date" name="exceptionDate" required style={adminControlStyle} />
          </label>

          <label
            style={{
              display: "grid",
              gridTemplateColumns: "18px 1fr",
              alignItems: "center",
              gap: 12,
              color: adminColors.textSoft,
              fontSize: 16,
              alignSelf: "end",
              minHeight: 56,
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${adminColors.border}`,
              background: isDayOff ? adminColors.panelActive : adminColors.panelStrong,
              padding: "0 16px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              name="isDayOff"
              checked={isDayOff}
              onChange={(event) => setIsDayOff(event.target.checked)}
              style={{
                width: 14,
                height: 14,
                accentColor: adminColors.text,
                margin: 0,
                cursor: "pointer",
              }}
            />
            Полный выходной
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Начало</span>
            <input type="time" name="startTime" disabled={isDayOff} style={adminControlStyle} />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Конец</span>
            <input type="time" name="endTime" disabled={isDayOff} style={adminControlStyle} />
          </label>
        </div>

        <label style={adminLabelStyle}>
          <span style={adminLabelTextStyle}>Причина</span>
          <textarea name="reason" rows={4} style={{ ...adminControlStyle, resize: "vertical" }} />
        </label>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, flexWrap: "wrap" }}>
          {error ? <span style={{ color: adminColors.danger }}>{error}</span> : null}
          {success ? <span style={{ color: adminColors.success }}>{success}</span> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...adminPrimaryButtonStyle,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.65 : 1,
            }}
          >
            {isSubmitting ? "Сохраняем..." : "Добавить исключение"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateScheduleExceptionForm;
