import { redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import CreateScheduleExceptionForm from "@/app/admin/schedule/CreateScheduleExceptionForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const weekDayLabels: Record<number, string> = {
  0: "Воскресенье",
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
};

const formatTimeOnly = (value: Date | null) =>
  value
    ? value.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : "—";

const AdminSchedulePage = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const [schedule, exceptions] = await Promise.all([
    prisma.work_schedule.findMany({
      orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
    }),
    prisma.schedule_exceptions.findMany({
      orderBy: { exception_date: "asc" },
      take: 30,
    }),
  ]);

  const scheduleByDay = schedule.reduce<Record<number, typeof schedule>>((acc, item) => {
    if (!acc[item.day_of_week]) {
      acc[item.day_of_week] = [];
    }

    acc[item.day_of_week].push(item);
    return acc;
  }, {});

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
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Расписание</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 720, lineHeight: 1.7 }}>
            Здесь видно основной рабочий график мастера и исключения по конкретным датам.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <CreateScheduleExceptionForm />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 7 }, (_, day) => (
          <div
            key={day}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(18,18,18,0.92)",
              padding: 20,
              minHeight: 180,
            }}
          >
            <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
              {weekDayLabels[day]}
            </p>

            {scheduleByDay[day]?.length ? (
              <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                {scheduleByDay[day].map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: 12,
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <strong style={{ fontSize: 16, fontWeight: 400 }}>
                      {formatTimeOnly(item.start_time)} - {formatTimeOnly(item.end_time)}
                    </strong>
                    <span style={{ color: "#a1a1aa" }}>
                      {item.is_dawn_hunt ? "Рассветная охота" : "Обычная смена"}
                    </span>
                    <span style={{ color: item.is_active ? "#d4d4d8" : "#fca5a5" }}>
                      {item.is_active ? "Активно" : "Неактивно"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#71717a", marginTop: 16 }}>Смен на этот день нет.</p>
            )}
          </div>
        ))}
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
            gridTemplateColumns: "minmax(150px,0.9fr) minmax(140px,0.8fr) minmax(180px,1fr) minmax(220px,1.4fr)",
            gap: 16,
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 12,
          }}
        >
          <span>Дата</span>
          <span>Тип дня</span>
          <span>Время</span>
          <span>Причина</span>
        </div>

        {exceptions.length === 0 ? (
          <p style={{ margin: 0, padding: 24, color: "#a1a1aa" }}>Исключений расписания пока нет.</p>
        ) : (
          exceptions.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(150px,0.9fr) minmax(140px,0.8fr) minmax(180px,1fr) minmax(220px,1.4fr)",
                gap: 16,
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#f5f5f5" }}>
                {new Date(item.exception_date).toLocaleDateString("ru-RU")}
              </span>
              <span style={{ color: "#d4d4d8" }}>{item.is_day_off ? "Выходной" : "Особый график"}</span>
              <span style={{ color: "#a1a1aa" }}>
                {item.is_day_off
                  ? "Не работает"
                  : `${formatTimeOnly(item.start_time)} - ${formatTimeOnly(item.end_time)}`}
              </span>
              <span style={{ color: "#a1a1aa" }}>{item.reason || "—"}</span>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default AdminSchedulePage;
