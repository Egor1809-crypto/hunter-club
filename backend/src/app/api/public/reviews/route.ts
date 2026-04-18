import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { createReview, listReviews } from "@/lib/reviews-store";
import { createPublicReviewSchema } from "@/lib/validations";

export const GET = async () => {
  try {
    const reviews = await listReviews({
      status: "published",
      take: 20,
    });

    return apiSuccess(reviews);
  } catch (error) {
    return apiError("Не удалось загрузить отзывы", 500);
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = createPublicReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const review = await createReview({
      customerName: parsed.data.customerName,
      serviceLabel: parsed.data.serviceLabel ?? null,
      rating: parsed.data.rating,
      message: parsed.data.message,
    });

    return apiSuccess(review);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось сохранить отзыв", 500);
  }
};
