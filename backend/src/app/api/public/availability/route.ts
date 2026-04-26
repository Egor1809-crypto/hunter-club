import { apiError, apiException, apiSuccess } from "@/lib/api";
import { getAvailabilityRange, getDayAvailability } from "@/lib/availability";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_AVAILABILITY_RANGE_DAYS = 45;

const parseDateOnlyParam = (value: string | null) => {
  if (!value || !DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getRangeDays = (from: Date, to: Date) => Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;

export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!serviceId) {
      return apiError("serviceId is required", 422);
    }

    if (date) {
      if (!parseDateOnlyParam(date)) {
        return apiError("date must use YYYY-MM-DD format", 422);
      }

      const result = await getDayAvailability({ date, serviceId });

      if (!result.service) {
        return apiError("Услуга недоступна", 404);
      }

      return apiSuccess(result);
    }

    if (dateFrom && dateTo) {
      const parsedDateFrom = parseDateOnlyParam(dateFrom);
      const parsedDateTo = parseDateOnlyParam(dateTo);

      if (!parsedDateFrom || !parsedDateTo) {
        return apiError("dateFrom and dateTo must use YYYY-MM-DD format", 422);
      }

      if (parsedDateFrom > parsedDateTo) {
        return apiError("dateFrom must be before or equal to dateTo", 422);
      }

      if (getRangeDays(parsedDateFrom, parsedDateTo) > MAX_AVAILABILITY_RANGE_DAYS) {
        return apiError(`Availability range cannot exceed ${MAX_AVAILABILITY_RANGE_DAYS} days`, 422);
      }

      const firstDay = await getDayAvailability({ date: dateFrom, serviceId });

      if (!firstDay.service) {
        return apiError("Услуга недоступна", 404);
      }

      const result = await getAvailabilityRange({ dateFrom, dateTo, serviceId });
      return apiSuccess(result);
    }

    return apiError("date or dateFrom/dateTo is required", 422);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось получить доступное время",
      context: { route: "/api/public/availability" },
    });
  }
};
