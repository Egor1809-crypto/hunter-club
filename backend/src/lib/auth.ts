import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE_NAME = "hunter_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const getSessionSecret = () => process.env.NEXTAUTH_SECRET || "change-me-in-production";

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

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as {
    id: string;
    username: string;
    role: string;
    displayName: string;
    exp: number;
  };

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
};

export const setAdminSessionCookie = (token: string) => {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
};

export const clearAdminSessionCookie = () => {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
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

  return plainPassword === storedHash;
};
