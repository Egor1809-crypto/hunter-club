import { prisma } from "@/lib/db";
import { parseDateOnly } from "@/lib/datetime";

const ACTIVE_BOOKING_STATUSES = ["scheduled", "confirmed", "in_progress"] as const;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateOnly = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const minutesFromTimeDate = (value: Date | null) => {
  if (!value) {
    return null;
  }

  return value.getUTCHours() * 60 + value.getUTCMinutes();
};

const buildDateTime = (date: Date, minutes: number) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Math.floor(minutes / 60),
    minutes % 60,
    0,
    0,
  );

const formatTime = (minutes: number) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

const rangesOverlap = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) => startA < endB && endA > startB;

export const getDayAvailability = async ({
  date,
  serviceId,
}: {
  date: string;
  serviceId: string;
}) => {
  const targetDate = parseDateOnly(date);
  const service = await prisma.services.findUnique({
    where: { id: serviceId },
  });

  if (!service || !service.is_active) {
    return {
      service: null,
      slots: [],
    };
  }

  const dayStart = new Date(targetDate);
  const dayEnd = new Date(targetDate);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [exception, workWindows, bookings] = await Promise.all([
    prisma.schedule_exceptions.findUnique({
      where: { exception_date: targetDate },
    }),
    prisma.work_schedule.findMany({
      where: {
        day_of_week: targetDate.getDay(),
        is_active: true,
      },
      orderBy: { start_time: "asc" },
    }),
    prisma.bookings.findMany({
      where: {
        scheduled_at: {
          gte: dayStart,
          lt: dayEnd,
        },
        status: {
          in: [...ACTIVE_BOOKING_STATUSES],
        },
      },
      select: {
        scheduled_at: true,
        duration_min: true,
      },
      orderBy: { scheduled_at: "asc" },
    }),
  ]);

  if (exception?.is_day_off) {
    return {
      service,
      slots: [],
    };
  }

  const windows = exception && !exception.is_day_off
    ? [
        {
          start: minutesFromTimeDate(exception.start_time),
          end: minutesFromTimeDate(exception.end_time),
        },
      ]
    : workWindows.map((item) => ({
        start: minutesFromTimeDate(item.start_time),
        end: minutesFromTimeDate(item.end_time),
      }));

  const slots = windows.flatMap((window) => {
    if (window.start === null || window.end === null) {
      return [];
    }

    const results: Array<{ time: string; available: boolean }> = [];

    for (let cursor = window.start; cursor + service.duration_min <= window.end; cursor += 60) {
      const slotStart = buildDateTime(targetDate, cursor);
      const slotEnd = new Date(slotStart.getTime() + service.duration_min * 60_000);

      const overlaps = bookings.some((booking) =>
        rangesOverlap(
          slotStart,
          slotEnd,
          booking.scheduled_at,
          new Date(booking.scheduled_at.getTime() + booking.duration_min * 60_000),
        ),
      );

      results.push({
        time: formatTime(cursor),
        available: !overlaps,
      });
    }

    return results;
  });

  return {
    service,
    slots,
  };
};

export const getAvailabilityRange = async ({
  dateFrom,
  dateTo,
  serviceId,
}: {
  dateFrom: string;
  dateTo: string;
  serviceId: string;
}) => {
  const start = parseDateOnly(dateFrom);
  const end = parseDateOnly(dateTo);
  const days: Array<{ date: string; available: boolean }> = [];

  const cursor = new Date(start);
  while (cursor <= end) {
    const formatted = formatDateOnly(cursor);
    const result = await getDayAvailability({
      date: formatted,
      serviceId,
    });

    days.push({
      date: formatted,
      available: result.slots.some((slot) => slot.available),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return { days };
};
