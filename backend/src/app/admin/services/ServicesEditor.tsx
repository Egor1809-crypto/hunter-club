"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.9)",
  color: "#f5f5f5",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};

const headerTextStyle: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "#9ca3af",
};

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

      const response = await fetch("/api/services", {
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
          gridTemplateColumns: "minmax(220px,1.4fr) minmax(120px,0.7fr) minmax(120px,0.7fr) minmax(120px,0.7fr) minmax(140px,0.8fr)",
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
            gridTemplateColumns: "minmax(220px,1.4fr) minmax(120px,0.7fr) minmax(120px,0.7fr) minmax(120px,0.7fr) minmax(140px,0.8fr)",
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

          <label style={{ display: "grid", gap: 8 }}>
            <span style={headerTextStyle}>Цена</span>
            <input
              type="number"
              min="0"
              step="100"
              value={item.price}
              onChange={(event) => updateItem(item.id, { price: event.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={headerTextStyle}>Минуты</span>
            <input
              type="number"
              min="1"
              step="5"
              value={item.durationMin}
              onChange={(event) => updateItem(item.id, { durationMin: event.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={headerTextStyle}>Порядок</span>
            <input
              type="number"
              step="1"
              value={item.sortOrder}
              onChange={(event) => updateItem(item.id, { sortOrder: event.target.value })}
              style={inputStyle}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#d4d4d8",
              fontSize: 14,
              minHeight: 48,
              marginTop: 30,
            }}
          >
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={(event) => updateItem(item.id, { isActive: event.target.checked })}
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
          padding: 20,
        }}
      >
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

        {error ? <span style={{ color: "#fca5a5" }}>{error}</span> : null}
        {success ? <span style={{ color: "#86efac" }}>{success}</span> : null}
      </div>
    </section>
  );
};

export default ServicesEditor;
