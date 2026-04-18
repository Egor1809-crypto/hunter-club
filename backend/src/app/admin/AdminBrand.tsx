import Link from "next/link";

const AdminBrand = ({
  compact = false,
  subtitle = "Hunter CRM",
  centered = false,
}: {
  compact?: boolean;
  subtitle?: string | null;
  centered?: boolean;
}) => {
  return (
    <Link
      href="/admin"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 10 : 14,
        textDecoration: "none",
        color: "#f5f5f5",
        justifyContent: centered ? "center" : undefined,
        width: centered ? "100%" : undefined,
      }}
    >
      <span
        style={{
          width: compact ? 42 : 52,
          height: compact ? 42 : 52,
          borderRadius: "999px",
          overflow: "hidden",
          background: "rgba(255,255,255,0.92)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 32px rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}
      >
        <img
          src={`/${encodeURIComponent("Хантер Лого.png")}`}
          alt="Hunter"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.18)",
          }}
        />
      </span>
      <span style={{ display: "grid", gap: 2 }}>
        {subtitle ? (
          <span
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#9ca3af",
            }}
          >
            {subtitle}
          </span>
        ) : null}
        <span
          style={{
            fontFamily: "var(--font-display), Georgia, serif",
            fontSize: compact ? 24 : 28,
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          Hunter
        </span>
      </span>
    </Link>
  );
};

export default AdminBrand;
