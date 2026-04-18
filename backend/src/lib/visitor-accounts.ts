import { prisma } from "@/lib/db";

export type VisitorAccountProfile = {
  id: string;
  name: string;
  phone: string;
  level: string;
  bonusPoints: number;
  nextVisit: {
    scheduledAt: string | null;
    service: string;
    barber: string;
  };
  history: Array<{
    date: string;
    service: string;
    result: string;
  }>;
};

type GoogleVisitorRow = {
  id: string;
  google_sub: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  linked_client_id: string | null;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Гость", lastName: null as string | null };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null as string | null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

declare global {
  var hunterVisitorAccountsReady: Promise<void> | undefined;
}

const ensureVisitorAccountsTable = async () => {
  if (!global.hunterVisitorAccountsReady) {
    global.hunterVisitorAccountsReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS visitor_accounts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          provider VARCHAR(20) NOT NULL,
          google_sub VARCHAR(255) UNIQUE,
          email VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          phone VARCHAR(20),
          linked_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
          last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await prisma.$executeRawUnsafe(
        "CREATE UNIQUE INDEX IF NOT EXISTS visitor_accounts_google_sub_idx ON visitor_accounts(google_sub)",
      );
    })();
  }

  await global.hunterVisitorAccountsReady;
};

const getAccountLevel = (totalVisits: number, isVip: boolean) => {
  if (isVip) {
    return "Black Card";
  }

  if (totalVisits >= 10) {
    return "Private Guest";
  }

  if (totalVisits >= 3) {
    return "Member";
  }

  return "Hunter Guest";
};

const buildClientBackedProfile = async ({
  id,
  fallbackName,
  fallbackPhone,
  linkedClientId,
}: {
  id: string;
  fallbackName: string;
  fallbackPhone: string;
  linkedClientId: string;
}): Promise<VisitorAccountProfile | null> => {
  const client = await prisma.clients.findUnique({
    where: { id: linkedClientId },
  });

  if (!client) {
    return null;
  }

  const [nextBooking, recentBookings, rewardsCount] = await Promise.all([
    prisma.bookings.findFirst({
      where: {
        client_id: client.id,
        scheduled_at: { gte: new Date() },
        status: { in: ["scheduled", "confirmed", "in_progress"] },
      },
      orderBy: { scheduled_at: "asc" },
      include: { service: true },
    }),
    prisma.bookings.findMany({
      where: { client_id: client.id },
      orderBy: { scheduled_at: "desc" },
      take: 5,
      include: { service: true },
    }),
    prisma.loyalty_rewards.count({
      where: {
        client_id: client.id,
        is_redeemed: false,
      },
    }),
  ]);

  const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ").trim() || fallbackName;
  const bonusPoints = client.total_visits * 50 + rewardsCount * 100;

  return {
    id,
    name: fullName,
    phone: client.phone || fallbackPhone,
    level: getAccountLevel(client.total_visits, client.is_vip),
    bonusPoints,
    nextVisit: nextBooking
      ? {
          scheduledAt: nextBooking.scheduled_at.toISOString(),
          service: nextBooking.service.name,
          barber: "Слава",
        }
      : {
          scheduledAt: null,
          service: "Пока без записи",
          barber: "Hunter",
        },
    history: recentBookings.map((booking) => ({
      date: booking.scheduled_at.toISOString(),
      service: booking.service.name,
      result:
        booking.notes?.trim() ||
        (booking.status === "completed" ? "Визит завершён в Hunter." : "Запись сохранена в истории клиента."),
    })),
  };
};

export const buildClientVisitorProfile = buildClientBackedProfile;

const buildStandaloneGoogleProfile = (visitor: GoogleVisitorRow): VisitorAccountProfile => ({
  id: visitor.id,
  name: visitor.name,
  phone: visitor.phone || visitor.email || "",
  level: "Hunter Guest",
  bonusPoints: 0,
  nextVisit: {
    scheduledAt: null,
    service: "Пока без записи",
    barber: "Hunter",
  },
  history: [],
});

export const upsertGoogleVisitorAccount = async ({
  googleSub,
  email,
  name,
  avatarUrl,
}: {
  googleSub: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}) => {
  await ensureVisitorAccountsTable();

  const rows = (await prisma.$queryRawUnsafe(
    `
      INSERT INTO visitor_accounts (provider, google_sub, email, name, avatar_url, last_login_at, updated_at)
      VALUES ('google', $1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (google_sub)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        last_login_at = NOW(),
        updated_at = NOW()
      RETURNING id, google_sub, email, name, avatar_url, phone, linked_client_id
    `,
    googleSub,
    email,
    name,
    avatarUrl,
  )) as GoogleVisitorRow[];

  return rows[0] ?? null;
};

export const getGoogleVisitorAccountById = async (id: string) => {
  await ensureVisitorAccountsTable();

  const rows = (await prisma.$queryRawUnsafe(
    `
      SELECT id, google_sub, email, name, avatar_url, phone, linked_client_id
      FROM visitor_accounts
      WHERE id = $1::uuid AND provider = 'google'
      LIMIT 1
    `,
    id,
  )) as GoogleVisitorRow[];

  return rows[0] ?? null;
};

export const buildGoogleVisitorProfile = async (visitorId: string) => {
  const visitor = await getGoogleVisitorAccountById(visitorId);

  if (!visitor) {
    return null;
  }

  if (visitor.linked_client_id) {
    const linkedProfile = await buildClientBackedProfile({
      id: visitor.id,
      fallbackName: visitor.name,
      fallbackPhone: visitor.phone || visitor.email || "",
      linkedClientId: visitor.linked_client_id,
    });

    if (linkedProfile) {
      return linkedProfile;
    }
  }

  return buildStandaloneGoogleProfile(visitor);
};

export const getGoogleVisitorNeedsPhoneLink = async (visitorId: string) => {
  const visitor = await getGoogleVisitorAccountById(visitorId);

  if (!visitor) {
    return false;
  }

  return !visitor.linked_client_id;
};

export const linkGoogleVisitorToPhone = async ({
  visitorId,
  phone,
}: {
  visitorId: string;
  phone: string;
}) => {
  await ensureVisitorAccountsTable();

  const visitor = await getGoogleVisitorAccountById(visitorId);

  if (!visitor) {
    return null;
  }

  const names = splitName(visitor.name);

  const client = await prisma.clients.upsert({
    where: { phone },
    update: {
      first_name: names.firstName,
      last_name: names.lastName,
    },
    create: {
      phone,
      first_name: names.firstName,
      last_name: names.lastName,
      notes: "Связано с Google-входом посетителя",
    },
  });

  await prisma.$executeRawUnsafe(
    `
      UPDATE visitor_accounts
      SET phone = $2, linked_client_id = $3, updated_at = NOW(), last_login_at = NOW()
      WHERE id = $1::uuid
    `,
    visitorId,
    phone,
    client.id,
  );

  return buildGoogleVisitorProfile(visitorId);
};
