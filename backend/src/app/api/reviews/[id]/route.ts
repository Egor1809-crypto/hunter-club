import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateReviewSchema } from "@/lib/validations";

type Params = {
  params: { id: string };
};

export const PATCH = async (request: Request, { params }: Params) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const review = await prisma.reviews.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
    });

    return apiSuccess(review);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось обновить отзыв", 500);
  }
};
