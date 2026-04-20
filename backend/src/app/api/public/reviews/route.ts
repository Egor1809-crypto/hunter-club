import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { createReview, listReviews } from "@/lib/reviews-store";
import { createPublicReviewSchema } from "@/lib/validations";

export const GET = async (request: Request) => {
  try {
    const reviews = await listReviews({
      status: "published",
      take: 20,
    });

    return apiSuccess(reviews);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось загрузить отзывы",
      context: { route: "/api/public/reviews", method: "GET" },
    });
  }
};

export const POST = async (request: Request) => {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
    const rateLimit = await checkRateLimit({
      key: `public-review:${clientIp}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Слишком много отзывов. Повторите через ${rateLimit.retryAfterSec} сек.`, 429);
    }

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
    return apiException({
      request,
      error,
      message: "Не удалось сохранить отзыв",
      context: { route: "/api/public/reviews", method: "POST" },
    });
  }
};
