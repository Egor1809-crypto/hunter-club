import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
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
  iat: number;
  exp: number;
};

const getVisitorSessionRevokeKey = ({ provider, subjectId }: { provider: string; subjectId?: string }) =>
  `visitor_session_revoked_after:${provider}:${subjectId ?? "anonymous"}`;

const toBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");
const fromBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");
const sign = (payload: string) => createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

export const createVisitorSessionToken = (payload: Omit<VisitorSessionPayload, "iat" | "exp">) => {
  const fullPayload: VisitorSessionPayload = {
    ...payload,
    iat: Date.now(),
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

  let payload: VisitorSessionPayload;

  try {
    payload = JSON.parse(fromBase64Url(encodedPayload));
  } catch {
    return null;
  }

  if (!Number.isFinite(payload.iat) || !Number.isFinite(payload.exp)) {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

const getVisitorSessionRevokedAfter = async (payload: Pick<VisitorSessionPayload, "provider" | "subjectId">) => {
  const setting = await prisma.settings.findUnique({
    where: { key: getVisitorSessionRevokeKey(payload) },
  });

  const value = setting?.value as unknown;

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "revokedAfter" in value &&
    typeof value.revokedAfter === "number"
  ) {
    return value.revokedAfter;
  }

  return null;
};

export const revokeVisitorSession = async (payload: Pick<VisitorSessionPayload, "provider" | "subjectId">) => {
  await prisma.settings.upsert({
    where: { key: getVisitorSessionRevokeKey(payload) },
    create: {
      key: getVisitorSessionRevokeKey(payload),
      value: { revokedAfter: Date.now() },
      description: "Visitor session revocation timestamp",
    },
    update: {
      value: { revokedAfter: Date.now() },
      updated_at: new Date(),
    },
  });
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

export const getCurrentVisitorSession = async () => {
  const token = cookies().get(VISITOR_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyVisitorSessionToken(token);

  if (!payload) {
    return null;
  }

  const revokedAfter = await getVisitorSessionRevokedAfter(payload);

  if (revokedAfter !== null && payload.iat <= revokedAfter) {
    return null;
  }

  return payload;
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
