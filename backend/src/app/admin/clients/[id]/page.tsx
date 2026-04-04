import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import EditClientForm from "@/app/admin/clients/[id]/EditClientForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const AdminClientDetailsPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const client = await prisma.clients.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { scheduled_at: "desc" },
        include: {
          service: true,
        },
        take: 20,
      },
      loyalty_rewards: {
        where: { is_redeemed: false },
        orderBy: { created_at: "desc" },
        take: 10,
        include: {
          rule: true,
        },
      },
    },
  });

  if (!client) {
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
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>
            {client.first_name} {client.last_name ?? ""}
          </h1>
          <p style={{ color: "#a1a1aa", maxWidth: 720, lineHeight: 1.7 }}>
            Детальная карточка клиента с редактированием, историей записей и активными наградами.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <div style={{ marginBottom: 24 }}>
        <Link href="/admin/clients" style={{ color: "#d4d4d8", textDecoration: "none" }}>
          ← Назад к клиентам
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
          { label: "Телефон", value: client.phone },
          { label: "Визиты", value: client.total_visits },
          { label: "Потрачено", value: `${Number(client.total_spent ?? 0)} ₽` },
          { label: "VIP", value: client.is_vip ? "Да" : "Нет" },
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
            <p style={{ fontSize: 28, fontWeight: 300, margin: "12px 0 0" }}>{String(item.value)}</p>
          </div>
        ))}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1.1fr) minmax(320px, 0.9fr)",
          gap: 24,
        }}
      >
        <div style={{ display: "grid", gap: 24 }}>
          <EditClientForm client={client} />

          <section
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(18,18,18,0.92)",
              padding: 20,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>
                История
              </p>
              <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 0" }}>Последние записи</h2>
            </div>

            {client.bookings.length === 0 ? (
              <p style={{ color: "#a1a1aa", margin: 0 }}>У клиента пока нет записей.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {client.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/admin/bookings/${booking.id}`}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: 16,
                      display: "grid",
                      gap: 6,
                      color: "#f5f5f5",
                      textDecoration: "none",
                    }}
                  >
                    <strong style={{ fontSize: 17, fontWeight: 400 }}>{booking.service.name}</strong>
                    <span style={{ color: "#a1a1aa" }}>
                      {new Date(booking.scheduled_at).toLocaleString("ru-RU")}
                    </span>
                    <span style={{ color: "#d4d4d8" }}>{booking.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

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
              Лояльность
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 300, margin: "10px 0 0" }}>Активные награды</h2>
          </div>

          {client.loyalty_rewards.length === 0 ? (
            <p style={{ color: "#a1a1aa", margin: 0 }}>Активных наград пока нет.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {client.loyalty_rewards.map((reward) => (
                <div
                  key={reward.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 16,
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <strong style={{ fontSize: 17, fontWeight: 400 }}>{reward.rule.name}</strong>
                  <span style={{ color: "#a1a1aa" }}>{reward.description}</span>
                  <span style={{ color: "#d4d4d8" }}>
                    {reward.rule.reward_type} · {Number(reward.rule.reward_value)} ₽
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default AdminClientDetailsPage;
