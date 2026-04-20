import { Prisma } from "@prisma/client";
import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateClientSchema } from "@/lib/validations";

type Params = {
  params: { id: string };
};

export const dynamic = "force-dynamic";

export const GET = async (_request: Request, { params }: Params) => {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const client = await prisma.clients.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        orderBy: { scheduled_at: "desc" },
        include: { service: true },
      },
      loyalty_rewards: {
        where: { is_redeemed: false },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!client) {
    return apiError("Клиент не найден", 404);
  }

  return apiSuccess(client);
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
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const client = await prisma.clients.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone } : {}),
        ...(parsed.data.firstName !== undefined ? { first_name: parsed.data.firstName } : {}),
        ...(parsed.data.lastName !== undefined ? { last_name: parsed.data.lastName } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.isVip !== undefined ? { is_vip: parsed.data.isVip } : {}),
      },
    });

    return apiSuccess(client);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось обновить клиента",
      context: { route: "/api/clients/[id]", clientId: params.id, method: "PATCH" },
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

    const bookingsCount = await prisma.bookings.count({
      where: { client_id: params.id },
    });

    if (bookingsCount > 0) {
      return apiError("Нельзя удалить клиента с историей записей", 409);
    }

    const client = await prisma.clients.delete({
      where: { id: params.id },
    });

    return apiSuccess({ deleted: true, client });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return apiError("Клиент не найден", 404);
    }

    return apiException({
      request,
      error,
      message: "Не удалось удалить клиента",
      context: { route: "/api/clients/[id]", clientId: params.id, method: "DELETE" },
    });
  }
};
