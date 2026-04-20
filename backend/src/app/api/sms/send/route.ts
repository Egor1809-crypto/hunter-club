import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminCsrf, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSmsProvider, sendSmsMessage } from "@/lib/sms";
import { sendSmsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const { admin, response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const csrfResponse = await requireAdminCsrf(request);

    if (csrfResponse) {
      return csrfResponse;
    }

    const rateLimit = await checkRateLimit({
      key: `admin-sms-send:${admin.id}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Слишком много SMS. Повторите через ${rateLimit.retryAfterSec} сек.`, 429);
    }

    const body = await request.json();
    const parsed = sendSmsSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const client = await prisma.clients.findUnique({
      where: { id: parsed.data.clientId },
    });

    if (!client) {
      return apiError("Client not found", 404);
    }

    const booking = parsed.data.bookingId
      ? await prisma.bookings.findUnique({
          where: { id: parsed.data.bookingId },
        })
      : null;

    if (parsed.data.bookingId && !booking) {
      return apiError("Booking not found", 404);
    }

    const provider = await getSmsProvider();

    const notification = await prisma.notifications.create({
      data: {
        client_id: client.id,
        booking_id: parsed.data.bookingId ?? null,
        type: parsed.data.type,
        channel: "sms",
        status: "pending",
        message: parsed.data.message,
        scheduled_for: new Date(),
      },
    });

    const smsResult = await sendSmsMessage({
      provider,
      phone: client.phone,
      message: parsed.data.message,
    });

    const updatedNotification = await prisma.notifications.update({
      where: { id: notification.id },
      data: {
        status: smsResult.status,
        sent_at: smsResult.status === "sent" ? new Date() : null,
        error_details: smsResult.errorDetails,
      },
      include: {
        client: true,
        booking: true,
      },
    });

    return apiSuccess({
      provider,
      notification: updatedNotification,
    });
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось отправить SMS",
      context: { route: "/api/sms/send" },
    });
  }
};
