import { Prisma } from "@prisma/client";
import { apiError, apiException, apiSuccess, formatZodError, parsePagination } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { hasBookingOverlap, lockBookingDay } from "@/lib/booking-overlap";
import { prisma } from "@/lib/db";
import { createBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

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

    const csrfResponse = await requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
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
    const booking = await prisma.$transaction(async (tx) => {
      await lockBookingDay(tx, scheduledAt);

      const hasOverlap = await hasBookingOverlap(tx, scheduledAt, service.duration_min);

      if (hasOverlap) {
        return null;
      }

      return tx.bookings.create({
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
    });

    if (!booking) {
      return apiError("Запись пересекается с уже существующим визитом", 409);
    }

    return apiSuccess(booking);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось создать запись",
      context: { route: "/api/bookings" },
    });
  }
};
