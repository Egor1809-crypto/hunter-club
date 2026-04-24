import Link from "next/link";
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
import CreateClientForm from "@/app/admin/clients/CreateClientForm";
import { getCurrentAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isDatabaseUnavailableError } from "@/lib/dev-admin";

const getSearchParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const clientActionButtonWidth = 236;

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

  let clients: Awaited<ReturnType<typeof prisma.clients.findMany>> = [];
  let isDevFallback = false;

  try {
    clients = await prisma.clients.findMany({
      where,
      orderBy,
      take: 50,
    });
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
        <AdminDevNotice message="База данных сейчас недоступна, поэтому список клиентов открыт в пустом dev-режиме." />
      ) : null}

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
          style={adminFilterGridStyle}
        >
          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Поиск</span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Имя или телефон"
              style={adminControlStyle}
            />
          </label>

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Тип клиента</span>
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

          <label style={adminLabelStyle}>
            <span style={adminLabelTextStyle}>Сортировка</span>
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

          <div
            style={{
              ...adminActionRowStyle,
              gridColumn: "1 / -1",
              justifySelf: "end",
              width: "fit-content",
            }}
          >
            <Link
              href="/admin/clients"
              style={{
                ...adminSecondaryButtonStyle,
                width: clientActionButtonWidth,
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
                width: clientActionButtonWidth,
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
