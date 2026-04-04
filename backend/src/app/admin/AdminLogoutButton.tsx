"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const AdminLogoutButton = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isSubmitting}
      style={{
        border: "1px solid rgba(255,255,255,0.14)",
        background: "transparent",
        color: "#f5f5f5",
        padding: "12px 16px",
        fontSize: 12,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        cursor: isSubmitting ? "not-allowed" : "pointer",
      }}
    >
      {isSubmitting ? "Выходим..." : "Выйти"}
    </button>
  );
};

export default AdminLogoutButton;
