import type { CSSProperties } from "react";
import { adminColors, adminTypography } from "@/app/admin/adminTheme";

export const adminLabelTextStyle: CSSProperties = {
  ...adminTypography.label,
  color: adminColors.textSubtle,
};

export const adminLabelStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  minWidth: 0,
};

export const adminControlStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  minHeight: 56,
  boxSizing: "border-box",
  border: `1px solid ${adminColors.border}`,
  background: adminColors.panelStrong,
  color: adminColors.text,
  padding: "14px 18px",
  fontSize: adminTypography.body.fontSize,
  lineHeight: 1.25,
  outline: "none",
  colorScheme: "dark",
};

export const adminFilterGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
  gap: 16,
  alignItems: "end",
  width: "100%",
};

export const adminFormGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
  gap: 16,
  width: "100%",
};

export const adminActionRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  flexWrap: "wrap",
  marginLeft: "auto",
};

export const adminPrimaryButtonStyle: CSSProperties = {
  border: "none",
  background: adminColors.text,
  color: adminColors.inverse,
  padding: "14px 18px",
  minHeight: 48,
  fontSize: adminTypography.label.fontSize,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  cursor: "pointer",
};

export const adminSecondaryButtonStyle: CSSProperties = {
  border: `1px solid ${adminColors.borderStrong}`,
  background: "transparent",
  color: adminColors.text,
  padding: "13px 18px",
  minHeight: 48,
  boxSizing: "border-box",
  fontSize: adminTypography.label.fontSize,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  textDecoration: "none",
};
