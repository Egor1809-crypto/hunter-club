import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { setGoogleOauthStateCookie } from "@/lib/visitor-auth";

export const GET = async () => {
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
