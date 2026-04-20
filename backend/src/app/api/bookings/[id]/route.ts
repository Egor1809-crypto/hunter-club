import { Prisma } from "@prisma/client";
import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateBookingSchema } from "@/lib/validations";

type Params = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

export const GET = async (_request: Request, { params }: Params) => {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const booking = await prisma.bookings.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      service: true,
    },
  });

  if (!booking) {
    return apiError("Запись не найдена", 404);
  }

  return apiSuccess(booking);
};

export const PATCH = async (request: Request, { params }: Params) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const csrfResponse = requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
    }

    const body = await request.json();
    const parsed = updateBookingSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const booking = await prisma.bookings.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.scheduledAt ? { scheduled_at: new Date(parsed.data.scheduledAt) } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.endedAt !== undefined
          ? { ended_at: parsed.data.endedAt ? new Date(parsed.data.endedAt) : null }
          : {}),
      },
      include: {
        client: true,
        service: true,
      },
    });

    return apiSuccess(booking);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось обновить запись",
      context: { route: "/api/bookings/[id]", bookingId: params.id, method: "PATCH" },
    });
  }
};

export const DELETE = async (request: Request, { params }: Params) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const csrfResponse = requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.notifications.deleteMany({
        where: { booking_id: params.id },
      });

      await tx.loyalty_rewards.updateMany({
        where: { booking_id: params.id },
        data: { booking_id: null },
      });

      await tx.loyalty_rewards.updateMany({
        where: { redeemed_booking_id: params.id },
        data: { redeemed_booking_id: null },
      });

      return tx.bookings.delete({
        where: { id: params.id },
      });
    });

    return apiSuccess({ deleted: true, booking });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return apiError("Запись не найдена", 404);
    }

    return apiException({
      request,
      error,
      message: "Не удалось удалить запись",
      context: { route: "/api/bookings/[id]", bookingId: params.id, method: "DELETE" },
    });
  }
};
