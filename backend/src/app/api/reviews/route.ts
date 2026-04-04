import { apiError, apiSuccess } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = async () => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const reviews = await prisma.reviews.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });

    return apiSuccess(reviews);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось получить отзывы", 500);
  }
};
