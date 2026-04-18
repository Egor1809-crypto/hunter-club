"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminBrand from "@/app/admin/AdminBrand";

const AdminLoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoBack = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    window.location.href = `${window.location.protocol}//${window.location.hostname}:8080/`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Не удалось войти");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Не удалось войти");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#0a0a0a",
      }}
    >
      <div style={{ width: "100%", maxWidth: 460 }}>
        <button
          type="button"
          onClick={handleGoBack}
          style={{
            marginBottom: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(12,12,12,0.78)",
            color: "#f5f5f5",
            padding: "12px 16px",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>←</span>
          Назад
        </button>

        <div
          style={{
            width: "100%",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(12,12,12,0.9)",
            padding: 40,
            backdropFilter: "blur(16px)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            borderRadius: 0,
          }}
        >
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}>
          <AdminBrand subtitle={null} centered />
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 300, margin: "0 0 8px", color: "#f5f5f5" }}>Вход в CRM</h1>
        <p style={{ color: "#a1a1aa", lineHeight: 1.6, marginBottom: 28 }}>
          Войдите, чтобы управлять клиентами, записями, расписанием и показателями барбершопа.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9ca3af" }}>
              Логин
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              style={{
                background: "#0f0f10",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f5f5f5",
                padding: "14px 16px",
                fontSize: 16,
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "#9ca3af" }}>
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              style={{
                background: "#0f0f10",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#f5f5f5",
                padding: "14px 16px",
                fontSize: 16,
              }}
            />
          </label>

          {error ? (
            <p style={{ color: "#f87171", margin: 0, lineHeight: 1.5 }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: 8,
              border: "none",
              background: "#f5f5f5",
              color: "#0a0a0a",
              padding: "14px 18px",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              transition: "transform 180ms ease, opacity 180ms ease",
            }}
          >
            {isSubmitting ? "Входим..." : "Войти"}
          </button>
        </form>
        </div>
      </div>
    </main>
  );
};

export default AdminLoginPage;
