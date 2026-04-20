import { Prisma } from "@prisma/client";
import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseDateOnly, parseTimeOnly } from "@/lib/datetime";
import { createScheduleExceptionSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const [schedule, exceptions] = await Promise.all([
      prisma.work_schedule.findMany({
        orderBy: [{ day_of_week: "asc" }, { start_time: "asc" }],
      }),
      prisma.schedule_exceptions.findMany({
        where:
          dateFrom || dateTo
            ? {
                exception_date: {
                  ...(dateFrom ? { gte: parseDateOnly(dateFrom) } : {}),
                  ...(dateTo ? { lte: parseDateOnly(dateTo) } : {}),
                },
              }
            : undefined,
        orderBy: { exception_date: "asc" },
      }),
    ]);

    return apiSuccess({
      schedule,
      exceptions,
    });
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось получить расписание",
      context: { route: "/api/schedule", method: "GET" },
    });
  }
};

export const POST = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const csrfResponse = requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
    }

    const body = await request.json();
    const parsed = createScheduleExceptionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const exception = await prisma.schedule_exceptions.create({
      data: {
        exception_date: parseDateOnly(parsed.data.exceptionDate),
        is_day_off: parsed.data.isDayOff ?? true,
        start_time: parsed.data.startTime ? parseTimeOnly(parsed.data.startTime) : null,
        end_time: parsed.data.endTime ? parseTimeOnly(parsed.data.endTime) : null,
        reason: parsed.data.reason ?? null,
      },
    });

    return apiSuccess(exception);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError("Исключение для этой даты уже существует", 409);
    }

    return apiException({
      request,
      error,
      message: "Не удалось создать исключение расписания",
      context: { route: "/api/schedule", method: "POST" },
    });
  }
};
