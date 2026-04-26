import { prisma } from "@/lib/db";

type BookingOverlapClient = Pick<typeof prisma, "bookings">;
type BookingLockClient = Pick<typeof prisma, "$executeRaw">;

const getBookingLockKey = (scheduledAt: Date) => {
  const day = scheduledAt.toISOString().slice(0, 10);
  return `hunter-bookings:${day}`;
};

export const lockBookingDay = async (db: BookingLockClient, scheduledAt: Date) => {
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${getBookingLockKey(scheduledAt)}, 0))`;
};

export const hasBookingOverlap = async (
  db: BookingOverlapClient,
  scheduledAt: Date,
  durationMin: number,
  ignoreId?: string,
) => {
  const start = scheduledAt;
  const end = new Date(start.getTime() + durationMin * 60_000);

  const bookings = await db.bookings.findMany({
    where: {
      ...(ignoreId ? { NOT: { id: ignoreId } } : {}),
      status: { in: ["scheduled", "confirmed", "in_progress"] },
    },
    select: {
      id: true,
      scheduled_at: true,
      duration_min: true,
    },
  });

  return bookings.some((booking) => {
    const bookingStart = booking.scheduled_at;
    const bookingEnd = new Date(bookingStart.getTime() + booking.duration_min * 60_000);

    return start < bookingEnd && end > bookingStart;
  });
};
