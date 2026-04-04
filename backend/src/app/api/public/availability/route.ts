import { apiError, apiSuccess } from "@/lib/api";
import { getAvailabilityRange, getDayAvailability } from "@/lib/availability";

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
      const result = await getDayAvailability({ date, serviceId });
      return apiSuccess(result);
    }

    if (dateFrom && dateTo) {
      const result = await getAvailabilityRange({ dateFrom, dateTo, serviceId });
      return apiSuccess(result);
    }

    return apiError("date or dateFrom/dateTo is required", 422);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch public availability", 500);
  }
};
