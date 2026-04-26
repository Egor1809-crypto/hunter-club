import { Prisma } from "@prisma/client";
import { apiError, apiException, apiSuccess } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatZodError } from "@/lib/api";
import { updateServicesSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const services = await prisma.services.findMany({
    orderBy: { sort_order: "asc" },
  });

  return apiSuccess(services);
};

export const PATCH = async (request: Request) => {
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
    const parsed = updateServicesSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const result = await prisma.$transaction(
      parsed.data.updates.map((update) =>
        prisma.services.update({
          where: { id: update.id },
          data: {
            ...(update.price !== undefined ? { price: new Prisma.Decimal(update.price) } : {}),
            ...(update.durationMin !== undefined ? { duration_min: update.durationMin } : {}),
            ...(update.isActive !== undefined ? { is_active: update.isActive } : {}),
            ...(update.sortOrder !== undefined ? { sort_order: update.sortOrder } : {}),
          },
        }),
      ),
    );

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return apiError("Услуга не найдена", 404);
    }

    return apiException({
      request,
      error,
      message: "Не удалось обновить услуги",
      context: { route: "/api/services" },
    });
  }
};
