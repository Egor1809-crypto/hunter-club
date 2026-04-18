import { apiError, apiSuccess } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { listReviews } from "@/lib/reviews-store";

export const GET = async () => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const reviews = await listReviews({ take: 100 });

    return apiSuccess(reviews);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось получить отзывы", 500);
  }
};
