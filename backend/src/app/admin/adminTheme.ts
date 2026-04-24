import type { CSSProperties } from "react";

export const adminColors = {
  text: "#f5f5f5",
  textSoft: "#d4d4d8",
  textMuted: "#a1a1aa",
  textSubtle: "#9ca3af",
  textFaint: "#71717a",
  panel: "rgba(18,18,18,0.92)",
  panelStrong: "rgba(10,10,10,0.92)",
  panelSoft: "rgba(255,255,255,0.045)",
  panelActive: "rgba(245,245,245,0.1)",
  border: "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  divider: "rgba(255,255,255,0.16)",
  success: "#86efac",
  danger: "#fca5a5",
  inverse: "#09090b",
} as const;

export const adminTypography = {
  nav: {
    fontSize: 12,
    letterSpacing: "0.24em",
    textTransform: "uppercase" as const,
    fontWeight: 300,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
  },
  label: {
    fontSize: 12,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 1.7,
  },
  bodyCompact: {
    fontSize: 16,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 300,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 300,
  },
  metric: {
    fontSize: 32,
    fontWeight: 300,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 400,
  },
  brand: {
    fontFamily: "var(--font-display), Georgia, serif",
    fontSize: 48,
    fontWeight: 300,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  },
} as const;

export const adminTextStyles = {
  eyebrow: {
    ...adminTypography.eyebrow,
    color: adminColors.textSubtle,
  } satisfies CSSProperties,
  label: {
    ...adminTypography.label,
    color: adminColors.textSubtle,
  } satisfies CSSProperties,
  bodyMuted: {
    ...adminTypography.body,
    color: adminColors.textMuted,
  } satisfies CSSProperties,
  title: {
    ...adminTypography.title,
    color: adminColors.text,
  } satisfies CSSProperties,
  heroTitle: {
    ...adminTypography.heroTitle,
    color: adminColors.text,
  } satisfies CSSProperties,
  metric: {
    ...adminTypography.metric,
    color: adminColors.text,
  } satisfies CSSProperties,
  cardTitle: {
    ...adminTypography.cardTitle,
    color: adminColors.text,
  } satisfies CSSProperties,
} as const;
