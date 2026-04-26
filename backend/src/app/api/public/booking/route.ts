import { Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { getDayAvailability } from "@/lib/availability";
import { hasBookingOverlap, lockBookingDay } from "@/lib/booking-overlap";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const publicBookingSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional().nullable(),
  phone: z.string().min(10).max(20),
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional().nullable(),
});

export const POST = async (request: Request) => {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const rateLimit = await checkRateLimit({
      key: `public-booking:${clientIp}`,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Слишком много попыток записи. Повторите через ${rateLimit.retryAfterSec} сек.`, 429);
    }

    const body = await request.json();
    const parsed = publicBookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const service = await prisma.services.findUnique({
      where: { id: parsed.data.serviceId },
    });

    if (!service || !service.is_active) {
      return apiError("Услуга недоступна", 404);
    }

    const scheduledAt = new Date(parsed.data.scheduledAt);
    const day = `${scheduledAt.getFullYear()}-${String(scheduledAt.getMonth() + 1).padStart(2, "0")}-${String(
      scheduledAt.getDate(),
    ).padStart(2, "0")}`;
    const time = `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`;

    const availability = await getDayAvailability({
      date: day,
      serviceId: service.id,
    });

    const selectedSlot = availability.slots.find((slot) => slot.time === time && slot.available);

    if (!selectedSlot) {
      return apiError("Выбранное время уже занято или недоступно", 409);
    }

    const normalizedPhone = parsed.data.phone.trim();

    const booking = await prisma.$transaction(async (tx) => {
      await lockBookingDay(tx, scheduledAt);

      const hasOverlap = await hasBookingOverlap(tx, scheduledAt, service.duration_min);

      if (hasOverlap) {
        return null;
      }

      const client = await tx.clients.upsert({
        where: { phone: normalizedPhone },
        update: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName ?? null,
          notes: parsed.data.notes ?? undefined,
        },
        create: {
          phone: normalizedPhone,
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName ?? null,
          notes: parsed.data.notes ?? null,
        },
      });

      return tx.bookings.create({
        data: {
          client_id: client.id,
          service_id: service.id,
          scheduled_at: scheduledAt,
          duration_min: service.duration_min,
          source: "website",
          price: service.price ? new Prisma.Decimal(service.price.toString()) : null,
          is_dawn_hunt: service.is_dawn_hunt,
          notes: parsed.data.notes ?? null,
        },
        include: {
          client: true,
          service: true,
        },
      });
    });

    if (!booking) {
      return apiError("Выбранное время уже занято или недоступно", 409);
    }

    return apiSuccess({
      id: booking.id,
      scheduledAt: booking.scheduled_at,
      client: {
        id: booking.client.id,
        firstName: booking.client.first_name,
        lastName: booking.client.last_name,
        phone: booking.client.phone,
      },
      service: {
        id: booking.service.id,
        name: booking.service.name,
      },
    });
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось создать запись с сайта",
      context: { route: "/api/public/booking" },
    });
  }
};
