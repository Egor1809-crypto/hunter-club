import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSessionSecret } from "@/lib/env";

const OTP_TTL_MS = 5 * 60 * 1000;

const hashOtpCode = ({ phone, code }: { phone: string; code: string }) =>
  createHmac("sha256", getSessionSecret()).update(`${phone}:${code}`).digest("hex");

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

export const normalizePhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length >= 11) {
    return `+${digits}`;
  }

  return null;
};

export const maskPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 4) {
    return phone;
  }

  const tail = digits.slice(-2);
  return `+${digits.slice(0, Math.max(1, digits.length - 6))} •• •• ${tail}`;
};

export const createPhoneOtp = async (phone: string) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  const now = Date.now();
  const code = String(randomInt(1000, 10_000));

  await prisma.phone_otps.deleteMany({
    where: { expires_at: { lte: new Date(now) } },
  });

  await prisma.phone_otps.upsert({
    where: { phone: normalizedPhone },
    create: {
      phone: normalizedPhone,
      code_hash: hashOtpCode({ phone: normalizedPhone, code }),
      expires_at: new Date(now + OTP_TTL_MS),
    },
    update: {
      code_hash: hashOtpCode({ phone: normalizedPhone, code }),
      expires_at: new Date(now + OTP_TTL_MS),
      updated_at: new Date(now),
    },
  });

  return {
    code,
    normalizedPhone,
    expiresInSec: Math.ceil(OTP_TTL_MS / 1000),
  };
};

export const deletePhoneOtp = async (phone: string) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return;
  }

  await prisma.phone_otps.deleteMany({
    where: { phone: normalizedPhone },
  });
};

export const verifyPhoneOtp = async ({ phone, code }: { phone: string; code: string }) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return {
      ok: false as const,
      reason: "invalid_phone" as const,
      normalizedPhone: null,
    };
  }

  const now = Date.now();

  await prisma.phone_otps.deleteMany({
    where: { expires_at: { lte: new Date(now) } },
  });

  const entry = await prisma.phone_otps.findUnique({
    where: { phone: normalizedPhone },
  });

  if (!entry) {
    return {
      ok: false as const,
      reason: "missing" as const,
      normalizedPhone,
    };
  }

  if (entry.expires_at.getTime() <= now) {
    await prisma.phone_otps.delete({
      where: { phone: normalizedPhone },
    });

    return {
      ok: false as const,
      reason: "expired" as const,
      normalizedPhone,
    };
  }

  const expectedHash = hashOtpCode({ phone: normalizedPhone, code });

  if (!safeEqual(entry.code_hash, expectedHash)) {
    return {
      ok: false as const,
      reason: "invalid_code" as const,
      normalizedPhone,
    };
  }

  await prisma.phone_otps.delete({
    where: { phone: normalizedPhone },
  });

  return {
    ok: true as const,
    normalizedPhone,
  };
};
