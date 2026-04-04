import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateClientSchema } from "@/lib/validations";

type Params = {
  params: { id: string };
};

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
    return apiError(error instanceof Error ? error.message : "Не удалось обновить клиента", 500);
  }
};
