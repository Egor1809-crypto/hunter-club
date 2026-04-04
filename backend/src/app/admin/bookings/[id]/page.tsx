import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import EditBookingForm from "@/app/admin/bookings/[id]/EditBookingForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const statusLabels: Record<string, string> = {
  scheduled: "Запланирована",
  confirmed: "Подтверждена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
  no_show: "Не пришёл",
};

const AdminBookingDetailsPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const booking = await prisma.bookings.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      service: true,
    },
  });

  if (!booking) {
    notFound();
  }

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
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Запись клиента</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 720, lineHeight: 1.7 }}>
            Детальная карточка записи с клиентом, услугой и быстрым редактированием визита.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/bookings" style={{ color: "#d4d4d8", textDecoration: "none" }}>
          ← Назад к записям
        </Link>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Клиент", value: `${booking.client.first_name} ${booking.client.last_name ?? ""}`.trim() },
          { label: "Услуга", value: booking.service.name },
          { label: "Статус", value: statusLabels[booking.status] ?? booking.status },
          { label: "Дата", value: new Date(booking.scheduled_at).toLocaleString("ru-RU") },
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
            <p style={{ fontSize: 28, fontWeight: 300, margin: "12px 0 0" }}>{item.value}</p>
          </div>
        ))}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1.05fr) minmax(320px, 0.95fr)",
          gap: 24,
        }}
      >
        <EditBookingForm booking={booking} />

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(18,18,18,0.92)",
            padding: 20,
            alignSelf: "start",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
              Контекст
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 0" }}>Детали визита</h2>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Телефон клиента</p>
              <p style={{ margin: 0, color: "#f5f5f5" }}>{booking.client.phone}</p>
            </div>

            <div>
              <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Длительность</p>
              <p style={{ margin: 0, color: "#f5f5f5" }}>{booking.duration_min} мин</p>
            </div>

            <div>
              <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Стоимость</p>
              <p style={{ margin: 0, color: "#f5f5f5" }}>{Number(booking.price ?? 0)} ₽</p>
            </div>

            <div>
              <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Источник</p>
              <p style={{ margin: 0, color: "#f5f5f5" }}>{booking.source}</p>
            </div>

            <div>
              <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Создана</p>
              <p style={{ margin: 0, color: "#f5f5f5" }}>{new Date(booking.created_at).toLocaleString("ru-RU")}</p>
            </div>

            {booking.ended_at ? (
              <div>
                <p style={{ color: "#9ca3af", margin: "0 0 6px" }}>Завершена</p>
                <p style={{ margin: 0, color: "#f5f5f5" }}>{new Date(booking.ended_at).toLocaleString("ru-RU")}</p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminBookingDetailsPage;
