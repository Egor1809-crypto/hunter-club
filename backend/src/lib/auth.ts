import { NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSessionSecret, isProduction } from "@/lib/env";

const SESSION_COOKIE_NAME = "hunter_admin_session";
const CSRF_COOKIE_NAME = "hunter_admin_csrf";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const getAdminSessionRevokeKey = (adminId: string) => `admin_session_revoked_after:${adminId}`;

const toBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");

const fromBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const sign = (payload: string) =>
  createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");

export const createSessionToken = (adminUser: {
  id: string;
  username: string;
  role: string;
  display_name: string;
}) => {
  const payload = JSON.stringify({
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    displayName: adminUser.display_name,
    iat: Date.now(),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });

  const encodedPayload = toBase64Url(payload);
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const verifySessionToken = (token: string) => {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  let payload: {
    id: string;
    username: string;
    role: string;
    displayName: string;
    iat: number;
    exp: number;
  };

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

const getAdminSessionRevokedAfter = async (adminId: string) => {
  const setting = await prisma.settings.findUnique({
    where: { key: getAdminSessionRevokeKey(adminId) },
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

export const revokeAdminSessions = async (adminId: string) => {
  await prisma.settings.upsert({
    where: { key: getAdminSessionRevokeKey(adminId) },
    create: {
      key: getAdminSessionRevokeKey(adminId),
      value: { revokedAfter: Date.now() },
      description: "Admin session revocation timestamp",
    },
    update: {
      value: { revokedAfter: Date.now() },
      updated_at: new Date(),
    },
  });
};

export const setAdminSessionCookie = (token: string) => {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const createAdminCsrfToken = () => randomBytes(32).toString("base64url");

export const setAdminCsrfCookie = (token: string) => {
  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const clearAdminSessionCookie = () => {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
    expires: new Date(0),
  });

  cookies().set(CSRF_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
    expires: new Date(0),
  });
};

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const requireAdminCsrf = (request: Request) => {
  const cookieToken = cookies().get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "CSRF token mismatch",
        meta: null,
      },
      { status: 403 },
    );
  }

  return null;
};

export const getCurrentAdminSession = async () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return null;
  }

  const revokedAfter = await getAdminSessionRevokedAfter(payload.id);

  if (revokedAfter !== null && payload.iat <= revokedAfter) {
    return null;
  }

  const adminUser = await prisma.admin_users.findUnique({
    where: { id: payload.id },
  });

  if (!adminUser || !adminUser.is_active) {
    return null;
  }

  return {
    id: adminUser.id,
    username: adminUser.username,
    role: adminUser.role,
    displayName: adminUser.display_name,
    lastLoginAt: adminUser.last_login_at,
  };
};

export const requireAdminSession = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized",
          meta: null,
        },
        { status: 401 },
      ),
    };
  }

  return {
    admin,
    response: null,
  };
};

export const verifyAdminPassword = async ({
  plainPassword,
  storedHash,
}: {
  plainPassword: string;
  storedHash: string;
}) => {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return compare(plainPassword, storedHash);
  }

  return false;
};
