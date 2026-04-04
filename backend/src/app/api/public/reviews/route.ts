import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createPublicReviewSchema } from "@/lib/validations";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = createPublicReviewSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const review = await prisma.reviews.create({
      data: {
        customer_name: parsed.data.customerName,
        service_label: parsed.data.serviceLabel ?? null,
        rating: parsed.data.rating,
        message: parsed.data.message,
      },
    });

    return apiSuccess(review);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось сохранить отзыв", 500);
  }
};
