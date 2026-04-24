import { redirect } from "next/navigation";
import AdminDevNotice from "@/app/admin/AdminDevNotice";
import AdminNav from "@/app/admin/AdminNav";
import AdminPageTop from "@/app/admin/AdminPageTop";
import ServicesEditor from "@/app/admin/services/ServicesEditor";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailableError } from "@/lib/dev-admin";

const AdminServicesPage = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  let services: Awaited<ReturnType<typeof prisma.services.findMany>> = [];
  let isDevFallback = false;

  try {
    services = await prisma.services.findMany({
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    isDevFallback = true;
  }

  const normalizedServices = services.map((service) => ({
    ...service,
    price: service.price?.toString() ?? null,
  }));

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" }}>
      <AdminPageTop />
      <AdminNav />

      {isDevFallback ? (
        <AdminDevNotice message="Услуги открыты в dev-режиме без базы данных. Реальный прайс появится после запуска PostgreSQL." />
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Всего услуг", value: normalizedServices.length },
          { label: "Активных", value: normalizedServices.filter((service) => service.is_active).length },
          { label: "Рассветных", value: normalizedServices.filter((service) => service.is_dawn_hunt).length },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(18,18,18,0.92)",
              padding: 20,
            }}
          >
            <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 32, fontWeight: 300, margin: "12px 0 0" }}>{item.value}</p>
          </div>
        ))}
      </section>

      <ServicesEditor services={normalizedServices} />
    </main>
  );
};

export default AdminServicesPage;
