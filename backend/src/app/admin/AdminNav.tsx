"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminBrand from "@/app/admin/AdminBrand";

const navItems = [
  { href: "/admin", label: "Панель" },
  { href: "/admin/clients", label: "Клиенты" },
  { href: "/admin/bookings", label: "Записи" },
  { href: "/admin/reviews", label: "Отзывы" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/schedule", label: "Расписание" },
];

const AdminNav = () => {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 28,
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(12,12,12,0.82)",
        padding: "14px 16px",
        backdropFilter: "blur(14px)",
      }}
    >
      <AdminBrand compact />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                border: isActive ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.12)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                padding: "10px 14px",
                textDecoration: "none",
                color: "#f5f5f5",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminNav;
