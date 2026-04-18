import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type ReviewRecord = {
  id: string;
  customer_name: string;
  service_label: string | null;
  rating: number;
  message: string;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export const listReviews = async ({
  status,
  take,
}: {
  status?: string;
  take: number;
}) => {
  const statusClause = status
    ? Prisma.sql`WHERE status = ${status}`
    : Prisma.sql``;

  return prisma.$queryRaw<ReviewRecord[]>(Prisma.sql`
    SELECT id, customer_name, service_label, rating, message, status, created_at, updated_at
    FROM public.reviews
    ${statusClause}
    ORDER BY created_at DESC
    LIMIT ${take}
  `);
};

export const createReview = async ({
  customerName,
  serviceLabel,
  rating,
  message,
}: {
  customerName: string;
  serviceLabel?: string | null;
  rating: number;
  message: string;
}) => {
  const rows = await prisma.$queryRaw<ReviewRecord[]>(Prisma.sql`
    INSERT INTO public.reviews (customer_name, service_label, rating, message)
    VALUES (${customerName}, ${serviceLabel ?? null}, ${rating}, ${message})
    RETURNING id, customer_name, service_label, rating, message, status, created_at, updated_at
  `);

  return rows[0] ?? null;
};

export const updateReviewStatus = async ({
  id,
  status,
}: {
  id: string;
  status?: string;
}) => {
  const rows = await prisma.$queryRaw<ReviewRecord[]>(Prisma.sql`
    UPDATE public.reviews
    SET
      status = COALESCE(${status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id}::uuid
    RETURNING id, customer_name, service_label, rating, message, status, created_at, updated_at
  `);

  return rows[0] ?? null;
};
