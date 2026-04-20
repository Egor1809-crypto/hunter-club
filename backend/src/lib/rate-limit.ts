import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
};

export const checkRateLimit = async ({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> => {
  const now = Date.now();
  const nowDate = new Date(now);
  const resetAt = new Date(now + windowMs);

  await prisma.rate_limits.deleteMany({
    where: {
      key,
      reset_at: { lte: nowDate },
    },
  });

  try {
    const created = await prisma.rate_limits.create({
      data: {
        key,
        count: 1,
        reset_at: resetAt,
      },
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSec: Math.max(1, Math.ceil((created.reset_at.getTime() - now) / 1000)),
    };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
      throw error;
    }
  }

  const incremented = await prisma.rate_limits.updateMany({
    where: {
      key,
      reset_at: { gt: nowDate },
      count: { lt: limit },
    },
    data: {
      count: { increment: 1 },
      updated_at: nowDate,
    },
  });

  const current = await prisma.rate_limits.findUnique({
    where: { key },
  });

  if (!current) {
    return checkRateLimit({ key, limit, windowMs });
  }

  const retryAfterSec = Math.max(1, Math.ceil((current.reset_at.getTime() - now) / 1000));

  if (incremented.count === 0) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSec,
  };
};
