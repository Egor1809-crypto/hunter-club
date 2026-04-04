import Link from "next/link";
import { redirect } from "next/navigation";
import AdminFilterSelect from "@/app/admin/AdminFilterSelect";
import AdminLogoutButton from "@/app/admin/AdminLogoutButton";
import AdminNav from "@/app/admin/AdminNav";
import CreateClientForm from "@/app/admin/clients/CreateClientForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const filterLabelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const filterInputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(10,10,10,0.92)",
  color: "#f5f5f5",
  padding: "12px 14px",
  fontSize: 14,
  outline: "none",
};

const AdminClientsPage = async ({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  const search = getSearchParam(searchParams?.search)?.trim() ?? "";
  const vip = getSearchParam(searchParams?.vip) ?? "all";
  const sort = getSearchParam(searchParams?.sort) ?? "recent";

  const where = {
    ...(search
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" as const } },
            { last_name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
    ...(vip === "vip" ? { is_vip: true } : {}),
    ...(vip === "regular" ? { is_vip: false } : {}),
  };

  const orderBy =
    sort === "name"
      ? [{ first_name: "asc" as const }, { last_name: "asc" as const }]
      : sort === "visits"
        ? [{ total_visits: "desc" as const }, { last_visit_at: "desc" as const }]
        : [{ last_visit_at: "desc" as const }, { created_at: "desc" as const }];

  const clients = await prisma.clients.findMany({
    where,
    orderBy,
    take: 50,
  });

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
          <h1 style={{ fontSize: 40, fontWeight: 300, margin: "10px 0 8px" }}>Клиенты</h1>
          <p style={{ color: "#a1a1aa", maxWidth: 680, lineHeight: 1.7 }}>
            Рабочий список клиентских карточек из реальной базы. Здесь можно быстро просматривать
            клиентскую базу барбершопа.
          </p>
        </div>

        <AdminLogoutButton />
      </div>

      <AdminNav />

      <CreateClientForm />

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
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <label style={filterLabelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Поиск
            </span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Имя или телефон"
              style={filterInputStyle}
            />
          </label>

          <label style={filterLabelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Тип клиента
            </span>
            <AdminFilterSelect
              name="vip"
              value={vip}
              ariaLabel="Тип клиента"
              options={[
                { value: "all", label: "Все" },
                { value: "vip", label: "Только VIP" },
                { value: "regular", label: "Обычные" },
              ]}
            />
          </label>

          <label style={filterLabelStyle}>
            <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "#9ca3af" }}>
              Сортировка
            </span>
            <AdminFilterSelect
              name="sort"
              value={sort}
              ariaLabel="Сортировка"
              options={[
                { value: "recent", label: "Сначала новые визиты" },
                { value: "visits", label: "По числу визитов" },
                { value: "name", label: "По имени" },
              ]}
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
              href="/admin/clients"
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
            gridTemplateColumns: "minmax(180px,1.4fr) minmax(170px,1fr) minmax(110px,0.7fr) minmax(120px,0.8fr)",
            gap: 16,
            padding: 16,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 12,
          }}
        >
          <span>Имя</span>
          <span>Телефон</span>
          <span>Визиты</span>
          <span>Последний визит</span>
        </div>

        {clients.length === 0 ? (
          <p style={{ margin: 0, padding: 24, color: "#a1a1aa" }}>По этим фильтрам клиенты не найдены.</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(180px,1.4fr) minmax(170px,1fr) minmax(110px,0.7fr) minmax(120px,0.8fr)",
                gap: 16,
                padding: 16,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
              }}
            >
              <div>
                <Link
                  href={`/admin/clients/${client.id}`}
                  style={{ display: "block", fontSize: 17, fontWeight: 500, color: "#f5f5f5", textDecoration: "none" }}
                >
                  {client.first_name} {client.last_name ?? ""}
                </Link>
                {client.notes ? (
                  <span style={{ display: "block", color: "#71717a", marginTop: 6, lineHeight: 1.5 }}>
                    {client.notes}
                  </span>
                ) : null}
              </div>
              <span style={{ color: "#d4d4d8" }}>{client.phone}</span>
              <span style={{ color: "#d4d4d8" }}>{client.total_visits}</span>
              <span style={{ color: "#a1a1aa" }}>
                {client.last_visit_at ? new Date(client.last_visit_at).toLocaleDateString("ru-RU") : "—"}
              </span>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default AdminClientsPage;
