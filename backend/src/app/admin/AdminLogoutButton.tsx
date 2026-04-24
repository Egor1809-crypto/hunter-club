"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminTypography } from "@/app/admin/adminTheme";

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
        border: "none",
        background: "transparent",
        color: "rgba(245,245,245,0.52)",
        padding: 0,
        fontSize: adminTypography.nav.fontSize,
        letterSpacing: adminTypography.nav.letterSpacing,
        textTransform: adminTypography.nav.textTransform,
        fontWeight: adminTypography.nav.fontWeight,
        cursor: isSubmitting ? "not-allowed" : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {isSubmitting ? "Выходим..." : "Выйти"}
    </button>
  );
};

export default AdminLogoutButton;
