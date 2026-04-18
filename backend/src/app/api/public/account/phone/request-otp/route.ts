import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { createPhoneOtp, maskPhoneNumber } from "@/lib/phone-otp";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSmsProvider, sendSmsMessage } from "@/lib/sms";
import { requestPhoneOtpSchema } from "@/lib/validations";

export const POST = async (request: Request) => {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

    const body = await request.json();
    const parsed = requestPhoneOtpSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const otp = createPhoneOtp(parsed.data.phone);

    if (!otp) {
      return apiError("Введите корректный номер телефона", 422);
    }

    const rateLimit = checkRateLimit({
      key: `public-phone-otp:${clientIp}:${otp.normalizedPhone}`,
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return apiError(`Слишком много попыток. Повторите через ${rateLimit.retryAfterSec} сек.`, 429);
    }

    const provider = await getSmsProvider();
    const smsResult = await sendSmsMessage({
      provider,
      phone: otp.normalizedPhone,
      message: `Hunter: ваш код подтверждения ${otp.code}. Он действует 5 минут.`,
    });

    if (smsResult.status !== "sent") {
      return apiError(smsResult.errorDetails ?? "Не удалось отправить код подтверждения", 500);
    }

    return apiSuccess({
      phone: otp.normalizedPhone,
      maskedPhone: maskPhoneNumber(otp.normalizedPhone),
      expiresInSec: otp.expiresInSec,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось отправить код подтверждения", 500);
  }
};
