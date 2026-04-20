import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { setGoogleOauthStateCookie } from "@/lib/visitor-auth";

export const dynamic = "force-dynamic";

export const GET = async (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";
  const rateLimit = await checkRateLimit({
    key: `public-google-start:${clientIp}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Слишком много попыток входа. Повторите через ${rateLimit.retryAfterSec} сек.`,
        meta: null,
      },
      { status: 429 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!clientId || !appUrl) {
    return NextResponse.json(
      { success: false, data: null, error: "Google OAuth is not configured", meta: null },
      { status: 500 },
    );
  }

  const state = randomUUID();
  setGoogleOauthStateCookie(state);

  const redirectUri = `${appUrl}/api/public/account/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};
