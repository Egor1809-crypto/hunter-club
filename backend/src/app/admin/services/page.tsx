import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import ServicesEditor from "@/app/admin/services/ServicesEditor";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const AdminServicesPage = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const services = await prisma.services.findMany({
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
  });

  const normalizedServices = services.map((service) => ({
    ...service,
    price: service.price?.toString() ?? null,
  }));

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9ca3af" }}>
            Hunter CRM
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Услуги</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 720, lineHeight: 1.7 }}>
            Управляйте прайсом, длительностью, порядком и активностью услуг. Сайт сразу подхватывает
            эти изменения через backend.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

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
