import { apiError, apiException, apiSuccess, formatZodError } from "@/lib/api";
import { verifyPhoneOtp } from "@/lib/phone-otp";
import { createVisitorSessionToken, getCurrentVisitorSession, setVisitorSessionCookie } from "@/lib/visitor-auth";
import { linkGooglePhoneSchema } from "@/lib/validations";
import { linkGoogleVisitorToPhone } from "@/lib/visitor-accounts";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const session = await getCurrentVisitorSession();

    if (!session || session.provider !== "google" || !session.subjectId) {
      return apiError("Сессия Google-входа не найдена", 401);
    }

    const body = await request.json();
    const parsed = linkGooglePhoneSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const verification = await verifyPhoneOtp({
      phone: parsed.data.phone,
      code: parsed.data.code,
    });

    if (!verification.ok || !verification.normalizedPhone) {
      const message =
        verification.reason === "expired"
          ? "Срок действия кода истёк. Запросите новый код."
          : "Неверный код подтверждения.";

      return apiError(message, 401);
    }

    const account = await linkGoogleVisitorToPhone({
      visitorId: session.subjectId,
      phone: verification.normalizedPhone,
    });

    if (!account) {
      return apiError("Не удалось связать Google-аккаунт с профилем клиента", 404);
    }

    const refreshedToken = createVisitorSessionToken({
      provider: "google",
      subjectId: session.subjectId,
      account,
    });

    await setVisitorSessionCookie(refreshedToken);

    return apiSuccess(account);
  } catch (error) {
    return apiException({
      request,
      error,
      message: "Не удалось связать номер телефона",
      context: { route: "/api/public/account/google/link-phone" },
    });
  }
};
