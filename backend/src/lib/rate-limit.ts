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

  return prisma.$transaction(async (tx) => {
    // Serialize rate-limit mutations per key to avoid create/update races under load.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;

    await tx.rate_limits.deleteMany({
      where: {
        key,
        reset_at: { lte: nowDate },
      },
    });

    const current = await tx.rate_limits.findUnique({
      where: { key },
    });

    if (!current) {
      const created = await tx.rate_limits.create({
        data: {
          key,
          count: 1,
          reset_at: resetAt,
          updated_at: nowDate,
        },
      });

      return {
        allowed: true,
        remaining: limit - 1,
        retryAfterSec: Math.max(1, Math.ceil((created.reset_at.getTime() - now) / 1000)),
      };
    }

    const retryAfterSec = Math.max(1, Math.ceil((current.reset_at.getTime() - now) / 1000));

    if (current.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec,
      };
    }

    const updated = await tx.rate_limits.update({
      where: { key },
      data: {
        count: { increment: 1 },
        updated_at: nowDate,
      },
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - updated.count),
      retryAfterSec: Math.max(1, Math.ceil((updated.reset_at.getTime() - now) / 1000)),
    };
  });
};
