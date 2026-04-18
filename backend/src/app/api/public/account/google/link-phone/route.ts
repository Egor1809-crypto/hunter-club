import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { verifyPhoneOtp } from "@/lib/phone-otp";
import { createVisitorSessionToken, getCurrentVisitorSession, setVisitorSessionCookie } from "@/lib/visitor-auth";
import { linkGooglePhoneSchema } from "@/lib/validations";
import { linkGoogleVisitorToPhone } from "@/lib/visitor-accounts";

export const POST = async (request: Request) => {
  try {
    const session = getCurrentVisitorSession();

    if (!session || session.provider !== "google" || !session.subjectId) {
      return apiError("Сессия Google-входа не найдена", 401);
    }

    const body = await request.json();
    const parsed = linkGooglePhoneSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const verification = verifyPhoneOtp({
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

    setVisitorSessionCookie(refreshedToken);

    return apiSuccess(account);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось связать номер телефона", 500);
  }
};
