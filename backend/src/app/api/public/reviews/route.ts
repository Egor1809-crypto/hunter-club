import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { createPublicReviewSchema } from "@/lib/validations";

export const GET = async () => {
  try {
    const reviews = await prisma.reviews.findMany({
      where: { status: "published" },
      orderBy: { created_at: "desc" },
      take: 20,
      select: {
        id: true,
        customer_name: true,
        service_label: true,
        rating: true,
        message: true,
        created_at: true,
      },
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
