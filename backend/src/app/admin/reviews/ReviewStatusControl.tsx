"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statusLabels: Record<string, string> = {
  new: "Новый",
  published: "Опубликован",
  archived: "В архиве",
};

const ReviewStatusControl = ({
  reviewId,
  currentStatus,
}: {
  reviewId: string;
  currentStatus: string;
}) => {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? "Не удалось обновить отзыв");
      }

      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось обновить отзыв");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        style={{
          width: "100%",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(10,10,10,0.9)",
          color: "#f5f5f5",
          padding: "10px 12px",
          fontSize: 12,
          letterSpacing: "0.08em",
          outline: "none",
        }}
      >
        {["new", "published", "archived"].map((item) => (
          <option key={item} value={item}>
            {statusLabels[item] ?? item}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={save}
        disabled={isSaving || status === currentStatus}
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "transparent",
          color: "#f5f5f5",
          padding: "10px 12px",
          fontSize: 12,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          cursor: isSaving || status === currentStatus ? "not-allowed" : "pointer",
          opacity: isSaving || status === currentStatus ? 0.5 : 1,
        }}
      >
        {isSaving ? "Сохраняем..." : "Обновить"}
      </button>

      {error ? <span style={{ color: "#fca5a5", fontSize: 12 }}>{error}</span> : null}
    </div>
  );
};

export default ReviewStatusControl;
