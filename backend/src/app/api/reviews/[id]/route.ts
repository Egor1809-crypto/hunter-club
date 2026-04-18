import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { updateReviewStatus } from "@/lib/reviews-store";
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

    const review = await updateReviewStatus({
      id: params.id,
      status: parsed.data.status,
    });

    if (!review) {
      return apiError("Отзыв не найден", 404);
    }

    return apiSuccess(review);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось обновить отзыв", 500);
  }
};
