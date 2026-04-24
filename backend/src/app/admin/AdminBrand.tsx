import Link from "next/link";
import { adminColors, adminTypography } from "@/app/admin/adminTheme";

const AdminBrand = ({ compact = false }: { compact?: boolean }) => {
  return (
    <Link
      href="/admin"
      style={{
        display: "inline-flex",
        textDecoration: "none",
        color: adminColors.text,
        fontFamily: adminTypography.brand.fontFamily,
        fontSize: compact ? adminTypography.brand.fontSize : 64,
        fontWeight: adminTypography.brand.fontWeight,
        lineHeight: 0.9,
        letterSpacing: adminTypography.brand.letterSpacing,
        textTransform: adminTypography.brand.textTransform,
        whiteSpace: "nowrap",
      }}
    >
      Hunter
    </Link>
  );
};

export default AdminBrand;
