import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { verifyPhoneOtp } from "@/lib/phone-otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyPhoneOtpSchema } from "@/lib/validations";
import { createVisitorSessionToken, setVisitorSessionCookie } from "@/lib/visitor-auth";

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

export const POST = async (request: Request) => {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

    const body = await request.json();
    const parsed = verifyPhoneOtpSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const rateLimit = checkRateLimit({
      key: `public-phone-verify:${clientIp}:${parsed.data.phone}`,
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Слишком много попыток. Повторите через ${rateLimit.retryAfterSec} сек.`, 429);
    }

    const verification = verifyPhoneOtp({
      phone: parsed.data.phone,
      code: parsed.data.code,
    });

    if (!verification.ok || !verification.normalizedPhone) {
      const message =
        verification.reason === "expired"
          ? "Срок действия кода истёк. Запросите новый код."
          : "Неверный код подтверждения.";

      return apiError(message, 401);
    }

    const client = await prisma.clients.upsert({
      where: { phone: verification.normalizedPhone },
      update: {},
      create: {
        phone: verification.normalizedPhone,
        first_name: "Гость",
        last_name: null,
        notes: "Создано через вход по номеру телефона",
      },
    });

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

    const fullName = [client.first_name, client.last_name].filter(Boolean).join(" ").trim() || verification.normalizedPhone;
    const bonusPoints = client.total_visits * 50 + rewardsCount * 100;

    const account = {
      id: client.id,
      name: fullName,
      phone: client.phone,
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
          (booking.status === "completed"
            ? "Визит завершён в Hunter."
            : "Запись сохранена в истории клиента."),
      })),
    };

    const sessionToken = createVisitorSessionToken({
      provider: "phone",
      subjectId: client.id,
      account,
    });
    setVisitorSessionCookie(sessionToken);

    return apiSuccess(account);
  } catch (error) {
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Не удалось подтвердить код";

    return apiError(message, 500);
  }
};
