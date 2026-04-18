import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSessionSecret, isProduction } from "@/lib/env";

const VISITOR_SESSION_COOKIE_NAME = "hunter_visitor_session";
const GOOGLE_STATE_COOKIE_NAME = "hunter_google_oauth_state";
const VISITOR_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type VisitorSessionPayload = {
  provider: "google" | "phone";
  subjectId?: string;
  account: {
    id: string;
    name: string;
    phone: string;
    level: string;
    bonusPoints: number;
    nextVisit: {
      scheduledAt: string | null;
      service: string;
      barber: string;
    };
    history: Array<{
      date: string;
      service: string;
      result: string;
    }>;
  };
  exp: number;
};

const toBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");
const sign = (payload: string) => createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

export const createVisitorSessionToken = (payload: Omit<VisitorSessionPayload, "exp">) => {
  const fullPayload: VisitorSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + VISITOR_SESSION_MAX_AGE,
  };

  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyVisitorSessionToken = (token: string) => {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as VisitorSessionPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

export const setVisitorSessionCookie = (token: string) => {
  cookies().set(VISITOR_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: VISITOR_SESSION_MAX_AGE,
  });
};

export const clearVisitorSessionCookie = () => {
  cookies().set(VISITOR_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: new Date(0),
  });
};

export const getCurrentVisitorSession = () => {
  const token = cookies().get(VISITOR_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyVisitorSessionToken(token);
};

export const setGoogleOauthStateCookie = (state: string) => {
  cookies().set(GOOGLE_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 60 * 10,
  });
};

export const getGoogleOauthStateCookie = () => cookies().get(GOOGLE_STATE_COOKIE_NAME)?.value ?? null;

export const clearGoogleOauthStateCookie = () => {
  cookies().set(GOOGLE_STATE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: new Date(0),
  });
};
