import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateBookingSchema } from "@/lib/validations";

type Params = {
  params: { id: string };
};

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
    return apiError(error instanceof Error ? error.message : "Не удалось обновить запись", 500);
  }
};
