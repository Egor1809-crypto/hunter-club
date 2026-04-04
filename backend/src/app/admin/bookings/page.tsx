import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import BookingStatusControl from "@/app/admin/bookings/BookingStatusControl";
import CreateBookingForm from "@/app/admin/bookings/CreateBookingForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const AdminBookingsPage = async ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const search = getSearchParam(searchParams?.search)?.trim() ?? "";
  const status = getSearchParam(searchParams?.status) ?? "all";
  const dateFrom = getSearchParam(searchParams?.dateFrom) ?? "";
  const dateTo = getSearchParam(searchParams?.dateTo) ?? "";

  const bookingWhere = {
    ...(status !== "all" ? { status: status as never } : {}),
    ...(search
      ? {
          OR: [
            { client: { first_name: { contains: search, mode: "insensitive" as const } } },
            { client: { last_name: { contains: search, mode: "insensitive" as const } } },
            { client: { phone: { contains: search } } },
            { service: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...((dateFrom || dateTo)
      ? {
          scheduled_at: {
            ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00`) } : {}),
            ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [bookings, clients, services] = await Promise.all([
    prisma.bookings.findMany({
      where: bookingWhere,
      orderBy: { scheduled_at: "desc" },
      take: 50,
      include: {
        client: true,
        service: true,
      },
    }),
    prisma.clients.findMany({
      orderBy: [{ last_visit_at: "desc" }, { created_at: "desc" }],
      take: 100,
    }),
    prisma.services.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    }),
  ]);

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
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Записи</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 680, lineHeight: 1.7 }}>
            Живая лента записей из базы с клиентом, услугой, датой и текущим статусом.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <CreateBookingForm clients={clients} services={services} />

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(18,18,18,0.92)",
          padding: 20,
          marginBottom: 24,
        }}
      >
        <form
          method="GET"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Поиск
            </span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Клиент, телефон, услуга"
              style={{
                width: "100%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,10,10,0.9)",
                color: "#f5f5f5",
                padding: "12px 14px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Статус
            </span>
            <select
              name="status"
              defaultValue={status}
              style={{
                width: "100%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,10,10,0.9)",
                color: "#f5f5f5",
                padding: "12px 14px",
                fontSize: 14,
                outline: "none",
              }}
            >
              <option value="all">Все</option>
              <option value="scheduled">Запланирована</option>
              <option value="confirmed">Подтверждена</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
              <option value="no_show">Не пришёл</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              С даты
            </span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              style={{
                width: "100%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,10,10,0.9)",
                color: "#f5f5f5",
                padding: "12px 14px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              По дату
            </span>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              style={{
                width: "100%",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(10,10,10,0.9)",
                color: "#f5f5f5",
                padding: "12px 14px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </label>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="submit"
              style={{
                border: "none",
                background: "#f5f5f5",
                color: "#09090b",
                padding: "14px 18px",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Применить
            </button>

            <Link
              href="/admin/bookings"
              style={{
                border: "1px solid rgba(255,255,255,0.14)",
                padding: "13px 18px",
                textDecoration: "none",
                color: "#f5f5f5",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Сбросить
            </Link>
          </div>
        </form>
      </section>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(18,18,18,0.92)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(170px,1fr) minmax(180px,1fr) minmax(180px,1fr) minmax(150px,0.9fr)",
            gap: 16,
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 12,
          }}
        >
          <span>Клиент</span>
          <span>Услуга</span>
          <span>Дата</span>
          <span>Статус</span>
        </div>

        {bookings.length === 0 ? (
          <p style={{ margin: 0, padding: 24, color: "#a1a1aa" }}>По этим фильтрам записи не найдены.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(170px,1fr) minmax(180px,1fr) minmax(180px,1fr) minmax(150px,0.9fr)",
                gap: 16,
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
              }}
            >
              <Link
                href={`/admin/bookings/${booking.id}`}
                style={{ fontSize: 16, fontWeight: 500, color: "#f5f5f5", textDecoration: "none" }}
              >
                {booking.client.first_name} {booking.client.last_name ?? ""}
              </Link>
              <span style={{ color: "#d4d4d8" }}>{booking.service.name}</span>
              <span style={{ color: "#a1a1aa" }}>
                {new Date(booking.scheduled_at).toLocaleString("ru-RU")}
              </span>
              <BookingStatusControl bookingId={booking.id} currentStatus={booking.status} />
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default AdminBookingsPage;
