import { apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = async () => {
  const services = await prisma.services.findMany({
    where: { is_active: true },
    orderBy: { sort_order: "asc" },
  });

  return apiSuccess(services);
};
