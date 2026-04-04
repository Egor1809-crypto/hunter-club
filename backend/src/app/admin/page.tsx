import { redirect } from "next/navigation";
import AdminBrand from "@/app/admin/AdminBrand";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const AdminPage = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const [clientsCount, bookingsCount, upcomingBookings, loyaltyRulesCount] = await Promise.all([
    prisma.clients.count(),
    prisma.bookings.count(),
    prisma.bookings.findMany({
      where: {
        scheduled_at: {
          gte: new Date(),
        },
        status: {
          in: ["scheduled", "confirmed", "in_progress"],
        },
      },
      orderBy: { scheduled_at: "asc" },
      take: 5,
      include: {
        client: true,
        service: true,
      },
    }),
    prisma.loyalty_rules.count(),
  ]);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <AdminBrand />
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 300, margin: "10px 0 8px" }}>
            Здравствуйте, {admin.displayName}
          </h1>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Клиенты", value: clientsCount },
          { label: "Записи", value: bookingsCount },
          { label: "Правила лояльности", value: loyaltyRulesCount },
          { label: "Роль", value: admin.role },
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
            <p style={{ fontSize: 32, fontWeight: 300, margin: "12px 0 0" }}>{String(item.value)}</p>
          </div>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          {
            title: "Клиенты",
            description: "Просматривайте клиентскую базу, визиты, телефоны и заметки.",
            href: "/admin/clients",
          },
          {
            title: "Записи",
            description: "Откройте ленту записей, чтобы видеть визиты и текущие статусы.",
            href: "/admin/bookings",
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(18,18,18,0.92)",
              padding: 20,
              color: "#f5f5f5",
              textDecoration: "none",
            }}
          >
            <strong style={{ display: "block", fontSize: 24, fontWeight: 300, marginBottom: 12 }}>
              {item.title}
            </strong>
            <span style={{ color: "#a1a1aa", lineHeight: 1.7 }}>{item.description}</span>
          </a>
        ))}
      </section>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(18,18,18,0.92)",
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
            Ближайшие записи
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 300, margin: "10px 0 0" }}>Ближайшие визиты</h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <p style={{ color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
            Пока ближайших записей нет. Как только появятся новые визиты, они отобразятся здесь.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 16,
                  display: "grid",
                  gap: 6,
                }}
              >
                <strong style={{ fontSize: 18, fontWeight: 400 }}>
                  {booking.client.first_name} {booking.client.last_name ?? ""}
                </strong>
                <span style={{ color: "#d4d4d8" }}>{booking.service.name}</span>
                <span style={{ color: "#9ca3af" }}>
                  {new Date(booking.scheduled_at).toLocaleString("ru-RU")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminPage;
