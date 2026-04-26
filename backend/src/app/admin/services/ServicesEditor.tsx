"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/app/admin/adminFetch";
import { adminControlStyle, adminLabelTextStyle } from "@/app/admin/adminFormStyles";

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string | number | null;
  duration_min: number;
  is_active: boolean;
  sort_order: number;
  is_dawn_hunt: boolean;
};

type EditableService = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: string;
  durationMin: string;
  sortOrder: string;
  isActive: boolean;
  isDawnHunt: boolean;
};

const inputStyle: React.CSSProperties = {
  ...adminControlStyle,
};

const headerTextStyle: React.CSSProperties = {
  ...adminLabelTextStyle,
  letterSpacing: "0.16em",
};

const serviceGridColumns =
  "minmax(220px,1.35fr) minmax(150px,0.75fr) minmax(150px,0.75fr) minmax(150px,0.75fr) minmax(136px,0.62fr)";

const formatNumberValue = (value: string, min: number, step: number) => {
  const parsedValue = Number(value === "" ? min : value);
  const nextValue = Number.isFinite(parsedValue) ? parsedValue + step : min;

  return String(Math.max(min, nextValue));
};

const NumberField = ({
  label,
  value,
  min,
  step,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  step: number;
  onChange: (value: string) => void;
}) => (
  <label style={{ display: "grid", gap: 8 }}>
    <span style={headerTextStyle}>{label}</span>
    <span style={{ position: "relative", display: "block", width: "100%" }}>
      <input
        className="admin-number-input"
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ ...inputStyle, paddingRight: 58, minHeight: 48 }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 1,
          right: 1,
          bottom: 1,
          width: 44,
          display: "grid",
          gridTemplateRows: "1fr 1fr",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.045)",
        }}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onChange(formatNumberValue(value, min, step))}
          style={{
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "transparent",
            color: "#d4d4d8",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ▲
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onChange(formatNumberValue(value, min, -step))}
          style={{
            border: "none",
            background: "transparent",
            color: "#d4d4d8",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ▼
        </button>
      </span>
    </span>
  </label>
);

const ServicesEditor = ({ services }: { services: ServiceItem[] }) => {
  const router = useRouter();
  const [items, setItems] = useState<EditableService[]>(
    services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      description: service.description,
      price: service.price === null ? "" : String(service.price),
      durationMin: String(service.duration_min),
      sortOrder: String(service.sort_order),
      isActive: service.is_active,
      isDawnHunt: service.is_dawn_hunt,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasChanges = useMemo(
    () =>
      items.some((item, index) => {
        const original = services[index];

        return (
          item.price !== (original.price === null ? "" : String(original.price)) ||
          item.durationMin !== String(original.duration_min) ||
          item.sortOrder !== String(original.sort_order) ||
          item.isActive !== original.is_active
        );
      }),
    [items, services],
  );

  const updateItem = (id: string, patch: Partial<EditableService>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const save = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = items.map((item) => ({
        id: item.id,
        price: item.price === "" ? 0 : Number(item.price),
        durationMin: Number(item.durationMin),
        isActive: item.isActive,
        sortOrder: Number(item.sortOrder),
      }));

      const response = await adminFetch("/api/services", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось обновить услуги");
      }

      setSuccess("Услуги обновлены");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось обновить услуги");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(18,18,18,0.92)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: serviceGridColumns,
          gap: 16,
          padding: 16,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontSize: 12,
        }}
      >
        <span>Услуга</span>
        <span>Цена</span>
        <span>Минуты</span>
        <span>Порядок</span>
        <span>Статус</span>
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: "grid",
            gridTemplateColumns: serviceGridColumns,
            gap: 16,
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 18, fontWeight: 400 }}>{item.name}</strong>
            <span style={{ color: "#71717a", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {item.slug}
            </span>
            {item.description ? (
              <span style={{ color: "#a1a1aa", lineHeight: 1.5 }}>{item.description}</span>
            ) : null}
            {item.isDawnHunt ? <span style={{ color: "#d4d4d8" }}>Рассветная охота</span> : null}
          </div>

          <NumberField
            label="Цена"
            value={item.price}
            min={0}
            step={100}
            onChange={(value) => updateItem(item.id, { price: value })}
          />

          <NumberField
            label="Минуты"
            value={item.durationMin}
            min={1}
            step={5}
            onChange={(value) => updateItem(item.id, { durationMin: value })}
          />

          <NumberField
            label="Порядок"
            value={item.sortOrder}
            min={1}
            step={1}
            onChange={(value) => updateItem(item.id, { sortOrder: value })}
          />

          <label
            style={{
              display: "inline-grid",
              gridTemplateColumns: "18px max-content",
              alignItems: "center",
              justifySelf: "start",
              gap: 10,
              color: "#d4d4d8",
              fontSize: 15,
              minHeight: 48,
              marginTop: 30,
              border: "1px solid rgba(255,255,255,0.12)",
              background: item.isActive ? "rgba(245,245,245,0.1)" : "rgba(10,10,10,0.9)",
              padding: "0 14px",
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={(event) => updateItem(item.id, { isActive: event.target.checked })}
              style={{
                width: 14,
                height: 14,
                accentColor: "#f5f5f5",
                cursor: "pointer",
                margin: 0,
              }}
            />
            Активна
          </label>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          padding: 20,
        }}
      >
        {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
        {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}

        <button
          type="button"
          onClick={save}
          disabled={!hasChanges || isSaving}
          style={{
            border: "none",
            background: "#f5f5f5",
            color: "#09090b",
            padding: "14px 18px",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: !hasChanges || isSaving ? "not-allowed" : "pointer",
            opacity: !hasChanges || isSaving ? 0.65 : 1,
          }}
        >
          {isSaving ? "Сохраняем..." : "Сохранить изменения"}
        </button>
      </div>
      <style jsx global>{`
        .admin-number-input::-webkit-outer-spin-button,
        .admin-number-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .admin-number-input {
          appearance: textfield;
          -moz-appearance: textfield;
        }
      `}</style>
    </section>
  );
};

export default ServicesEditor;
