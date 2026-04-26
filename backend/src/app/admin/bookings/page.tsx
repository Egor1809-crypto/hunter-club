import Link from "next/link";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import AdminFilterSelect from "@/app/admin/AdminFilterSelect";
import AdminDevNotice from "@/app/admin/AdminDevNotice";
import AdminNav from "@/app/admin/AdminNav";
import AdminPageTop from "@/app/admin/AdminPageTop";
import {
  adminActionRowStyle,
  adminControlStyle,
  adminFilterGridStyle,
  adminLabelStyle,
  adminLabelTextStyle,
  adminPrimaryButtonStyle,
  adminSecondaryButtonStyle,
} from "@/app/admin/adminFormStyles";
import BookingStatusControl from "@/app/admin/bookings/BookingStatusControl";
import CreateBookingForm from "@/app/admin/bookings/CreateBookingForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailableError } from "@/lib/dev-admin";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type BookingListItem = Prisma.bookingsGetPayload<{
  include: {
    client: true;
    service: true;
  };
}>;

const bookingActionButtonWidth = 236;

const AdminBookingsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const search = getSearchParam(resolvedSearchParams.search)?.trim() ?? "";
  const status = getSearchParam(resolvedSearchParams.status) ?? "all";
  const dateFrom = getSearchParam(resolvedSearchParams.dateFrom) ?? "";
  const dateTo = getSearchParam(resolvedSearchParams.dateTo) ?? "";

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

  let bookings: BookingListItem[] = [];
  let clients: {
    id: string;
    first_name: string;
    last_name: string | null;
    phone: string;
  }[] = [];
  let services: {
    id: string;
    name: string;
    duration_min: number;
  }[] = [];
  let isDevFallback = false;

  try {
    [bookings, clients, services] = await Promise.all([
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
        select: {
          id: true,
          first_name: true,
          last_name: true,
          phone: true,
        },
      }),
      prisma.services.findMany({
        where: { is_active: true },
        orderBy: [{ sort_order: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          duration_min: true,
        },
      }),
    ]);
  } catch (error) {
    if (!isDatabaseUnavailableError(error)) {
      throw error;
    }

    isDevFallback = true;
  }

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 72px" }}>
      <AdminPageTop />
      <AdminNav />

      {isDevFallback ? (
        <AdminDevNotice message="Список записей открыт без PostgreSQL, поэтому сейчас доступен только интерфейс без реальных данных." />
      ) : null}

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
          style={adminFilterGridStyle}
        >
          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Поиск</span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Клиент, телефон, услуга"
              style={adminControlStyle}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Статус</span>
            <AdminFilterSelect
              name="status"
              value={status}
              ariaLabel="Статус записи"
              options={[
                { value: "all", label: "Все" },
                { value: "scheduled", label: "Запланирована" },
                { value: "confirmed", label: "Подтверждена" },
                { value: "in_progress", label: "В работе" },
                { value: "completed", label: "Завершена" },
                { value: "cancelled", label: "Отменена" },
                { value: "no_show", label: "Не пришёл" },
              ]}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>С даты</span>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              style={adminControlStyle}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>По дату</span>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              style={adminControlStyle}
            />
          </label>

          <div
            style={{
              ...adminActionRowStyle,
              gridColumn: "1 / -1",
              justifySelf: "end",
              width: "fit-content",
            }}
          >
            <Link
              href="/admin/bookings"
              style={{
                ...adminSecondaryButtonStyle,
                width: bookingActionButtonWidth,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Сбросить
            </Link>

            <button
              type="submit"
              style={{
                ...adminPrimaryButtonStyle,
                width: bookingActionButtonWidth,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Применить
            </button>
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

        {bookings.length > 0 ? (
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
        ) : null}
      </section>
    </main>
  );
};

export default AdminBookingsPage;
