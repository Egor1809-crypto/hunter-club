import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, formatZodError, parsePagination } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";

const hasBookingOverlap = async (scheduledAt: Date, durationMin: number, ignoreId?: string) => {
  const start = scheduledAt;
  const end = new Date(start.getTime() + durationMin * 60_000);

  const bookings = await prisma.bookings.findMany({
    where: {
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      status: { in: ["scheduled", "confirmed", "in_progress"] },
    },
    select: {
      id: true,
      scheduled_at: true,
      duration_min: true,
    },
  });

  return bookings.some((booking) => {
    const bookingStart = booking.scheduled_at;
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration_min * 60_000);

    return start < bookingEnd && end > bookingStart;
  });
};

export const GET = async (request: Request) => {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const isDawnHunt = searchParams.get("isDawnHunt");

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(typeof isDawnHunt === "string" ? { is_dawn_hunt: isDawnHunt === "true" } : {}),
    ...((dateFrom || dateTo)
      ? {
          scheduled_at: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.bookings.findMany({
      where,
      skip,
      take,
      orderBy: { scheduled_at: "desc" },
      include: {
        client: true,
        service: true,
      },
    }),
    prisma.bookings.count({ where }),
  ]);

  return apiSuccess(items, { total, page, pageSize });
};

export const POST = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const service = await prisma.services.findUnique({
      where: { id: parsed.data.serviceId },
    });

    if (!service) {
      return apiError("Услуга не найдена", 404);
    }

    if (!service.is_active) {
      return apiError("Услуга сейчас неактивна", 409);
    }

    const client = await prisma.clients.findUnique({
      where: { id: parsed.data.clientId },
    });

    if (!client) {
      return apiError("Клиент не найден", 404);
    }

    const scheduledAt = new Date(parsed.data.scheduledAt);
    const hasOverlap = await hasBookingOverlap(scheduledAt, service.duration_min);

    if (hasOverlap) {
      return apiError("Запись пересекается с уже существующим визитом", 409);
    }

    const booking = await prisma.bookings.create({
      data: {
        client_id: client.id,
        service_id: service.id,
        scheduled_at: scheduledAt,
        duration_min: service.duration_min,
        source: parsed.data.source ?? "phone",
        price: service.price ? new Prisma.Decimal(service.price.toString()) : null,
        is_dawn_hunt: service.is_dawn_hunt,
        notes: parsed.data.notes ?? null,
      },
      include: {
        client: true,
        service: true,
      },
    });

    return apiSuccess(booking);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось создать запись", 500);
  }
};
