import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAppUrl, getFrontendUrl, isProduction } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { setGoogleOauthReturnToCookie, setGoogleOauthStateCookie } from "@/lib/visitor-auth";

const getSafeReturnTo = (request: Request) => {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");

  if (!returnTo) {
    return getFrontendUrl();
  }

  try {
    const parsed = new URL(returnTo);
    const allowedOrigins = new Set([new URL(getFrontendUrl()).origin, new URL(getAppUrl()).origin]);

    if (!isProduction) {
      allowedOrigins.add("http://localhost:8080");
      allowedOrigins.add("http://127.0.0.1:8080");
    }

    if (allowedOrigins.has(parsed.origin)) {
      return parsed.origin;
    }
  } catch {
    return getFrontendUrl();
  }

  return getFrontendUrl();
};

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
  const backendUrl = new URL(request.url).origin;

  if (!clientId) {
    return NextResponse.json(
      { success: false, data: null, error: "Google OAuth is not configured", meta: null },
      { status: 500 },
    );
  }

  const state = randomUUID();
  const returnTo = getSafeReturnTo(request);
  await setGoogleOauthStateCookie(state);
  await setGoogleOauthReturnToCookie(returnTo);

  const redirectUri = `${backendUrl}/api/public/account/google/callback`;
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
