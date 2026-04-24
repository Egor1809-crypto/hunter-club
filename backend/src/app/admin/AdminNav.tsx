"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminBrand from "@/app/admin/AdminBrand";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import { adminColors, adminTypography } from "@/app/admin/adminTheme";

const navItems = [
  { href: "/admin", label: "Панель" },
  { href: "/admin/clients", label: "Клиенты" },
  { href: "/admin/bookings", label: "Записи" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/schedule", label: "Расписание" },
];

const AdminNav = () => {
  const pathname = usePathname();
  const leftItems = navItems.slice(0, 3);
  const rightItems = navItems.slice(3);
  const separator = (
    <span
      style={{
        color: adminColors.divider,
        fontSize: 22,
        lineHeight: 1,
        transform: "scaleX(1.7)",
        display: "inline-block",
      }}
    >
      -
    </span>
  );

  const renderNavLink = (item: (typeof navItems)[number]) => {
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        style={{
          textDecoration: "none",
          color: isActive ? adminColors.text : "rgba(245,245,245,0.52)",
          fontSize: adminTypography.nav.fontSize,
          textTransform: adminTypography.nav.textTransform,
          letterSpacing: adminTypography.nav.letterSpacing,
          transition: "color 180ms ease",
          whiteSpace: "nowrap",
          fontWeight: adminTypography.nav.fontWeight,
        }}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
        alignItems: "center",
        gap: 36,
        marginBottom: 32,
        padding: "6px 0 18px",
        borderBottom: `1px solid ${adminColors.borderSoft}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          minWidth: 0,
        }}
      >
        {leftItems.map((item, index) => (
          <div key={item.href} style={{ display: "inline-flex", alignItems: "center", gap: 24 }}>
            {renderNavLink(item)}
            {index < leftItems.length - 1 || index === leftItems.length - 1 ? separator : null}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <AdminBrand compact />
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "center",
          justifyContent: "flex-end",
          flexWrap: "nowrap",
          minWidth: 0,
        }}
      >
        {rightItems.map((item) => (
          <div key={item.href} style={{ display: "inline-flex", alignItems: "center", gap: 24 }}>
            {separator}
            {renderNavLink(item)}
          </div>
        ))}
        {separator}
        <AdminLogoutButton />
      </div>
    </nav>
  );
};

export default AdminNav;
