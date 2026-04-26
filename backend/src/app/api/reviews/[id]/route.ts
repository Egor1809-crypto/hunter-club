import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { updateReviewStatus } from "@/lib/reviews-store";
import { updateReviewSchema, uuidParamSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export const PATCH = async (request: Request, { params }: Params) => {
  const { id } = await params;

  try {
    const parsedId = uuidParamSchema.safeParse(id);

    if (!parsedId.success) {
      return apiError("Некорректный id отзыва", 422);
    }

    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const csrfResponse = await requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
    }

    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const review = await updateReviewStatus({
      id,
      status: parsed.data.status,
    });

    if (!review) {
      return apiError("Отзыв не найден", 404);
    }

    return apiSuccess(review);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось обновить отзыв",
      context: { route: "/api/reviews/[id]", reviewId: id },
    });
  }
};
