import { apiError, apiSuccess } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const getPeriodStart = (period: string) => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case "7d":
      start.setDate(now.getDate() - 6);
      break;
    case "30d":
      start.setDate(now.getDate() - 29);
      break;
    case "90d":
      start.setDate(now.getDate() - 89);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      start.setDate(now.getDate() + 1);
      break;
    default:
      start.setDate(now.getDate() - 29);
      break;
  }

  start.setHours(0, 0, 0, 0);
  return start;
};

export const GET = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "30d";
    const startDate = getPeriodStart(period);

    const daily = await prisma.analytics_daily.findMany({
      where: {
        report_date: {
          gte: startDate,
        },
      },
      orderBy: { report_date: "asc" },
    });

    const summary = daily.reduce(
      (acc, item) => ({
        totalBookings: acc.totalBookings + item.total_bookings,
        completed: acc.completed + item.completed,
        cancelled: acc.cancelled + item.cancelled,
        noShows: acc.noShows + item.no_shows,
        dawnHunts: acc.dawnHunts + item.dawn_hunts,
        revenue: acc.revenue + Number(item.revenue),
        newClients: acc.newClients + item.new_clients,
        avgServiceMinSum:
          acc.avgServiceMinSum + (item.avg_service_min ? Number(item.avg_service_min) : 0),
        avgServiceMinCount: acc.avgServiceMinCount + (item.avg_service_min ? 1 : 0),
      }),
      {
        totalBookings: 0,
        completed: 0,
        cancelled: 0,
        noShows: 0,
        dawnHunts: 0,
        revenue: 0,
        newClients: 0,
        avgServiceMinSum: 0,
        avgServiceMinCount: 0,
      },
    );

    return apiSuccess({
      summary: {
        totalBookings: summary.totalBookings,
        completed: summary.completed,
        cancelled: summary.cancelled,
        noShows: summary.noShows,
        dawnHunts: summary.dawnHunts,
        revenue: summary.revenue,
        newClients: summary.newClients,
        avgServiceMin:
          summary.avgServiceMinCount > 0
            ? Number((summary.avgServiceMinSum / summary.avgServiceMinCount).toFixed(2))
            : null,
      },
      daily,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch analytics", 500);
  }
};
