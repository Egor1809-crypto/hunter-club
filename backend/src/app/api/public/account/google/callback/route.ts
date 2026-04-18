import { NextResponse } from "next/server";
import { clearGoogleOauthStateCookie, createVisitorSessionToken, getGoogleOauthStateCookie, setVisitorSessionCookie } from "@/lib/visitor-auth";
import { buildGoogleVisitorProfile, upsertGoogleVisitorAccount } from "@/lib/visitor-accounts";

type GoogleTokenResponse = {
  access_token: string;
  id_token?: string;
};

type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const frontendUrl = `${url.protocol}//${url.hostname}:8080/account?method=google`;

  const expectedState = getGoogleOauthStateCookie();
  clearGoogleOauthStateCookie();

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${frontendUrl}&error=google_state`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!clientId || !clientSecret || !appUrl) {
    return NextResponse.redirect(`${frontendUrl}&error=google_config`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/public/account/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${frontendUrl}&error=google_token`);
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${frontendUrl}&error=google_userinfo`);
    }

    const user = (await userResponse.json()) as GoogleUserInfo;

    const visitor = await upsertGoogleVisitorAccount({
      googleSub: user.sub,
      email: user.email ?? null,
      name: user.name,
      avatarUrl: user.picture ?? null,
    });

    if (!visitor) {
      return NextResponse.redirect(`${frontendUrl}&error=google_account`);
    }

    const account = await buildGoogleVisitorProfile(visitor.id);

    if (!account) {
      return NextResponse.redirect(`${frontendUrl}&error=google_profile`);
    }

    const sessionToken = createVisitorSessionToken({
      provider: "google",
      subjectId: visitor.id,
      account,
    });

    setVisitorSessionCookie(sessionToken);

    return NextResponse.redirect(frontendUrl);
  } catch {
    return NextResponse.redirect(`${frontendUrl}&error=google_callback`);
  }
};
