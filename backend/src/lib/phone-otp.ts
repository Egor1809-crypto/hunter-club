type PhoneOtpEntry = {
  code: string;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var hunterPhoneOtpStore: Map<string, PhoneOtpEntry> | undefined;
}

const otpStore = global.hunterPhoneOtpStore ?? new Map<string, PhoneOtpEntry>();

if (process.env.NODE_ENV !== "production") {
  global.hunterPhoneOtpStore = otpStore;
}

const OTP_TTL_MS = 5 * 60 * 1000;

const pruneExpiredOtps = (now: number) => {
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt <= now) {
      otpStore.delete(phone);
    }
  }
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

export const createPhoneOtp = (phone: string) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  const now = Date.now();
  pruneExpiredOtps(now);

  const code = String(Math.floor(1000 + Math.random() * 9000));
  otpStore.set(normalizedPhone, {
    code,
    expiresAt: now + OTP_TTL_MS,
  });

  return {
    code,
    normalizedPhone,
    expiresInSec: Math.ceil(OTP_TTL_MS / 1000),
  };
};

export const verifyPhoneOtp = ({ phone, code }: { phone: string; code: string }) => {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    return {
      ok: false as const,
      reason: "invalid_phone" as const,
      normalizedPhone: null,
    };
  }

  const now = Date.now();
  pruneExpiredOtps(now);

  const entry = otpStore.get(normalizedPhone);

  if (!entry) {
    return {
      ok: false as const,
      reason: "missing" as const,
      normalizedPhone,
    };
  }

  if (entry.expiresAt <= now) {
    otpStore.delete(normalizedPhone);

    return {
      ok: false as const,
      reason: "expired" as const,
      normalizedPhone,
    };
  }

  if (entry.code !== code) {
    return {
      ok: false as const,
      reason: "invalid_code" as const,
      normalizedPhone,
    };
  }

  otpStore.delete(normalizedPhone);

  return {
    ok: true as const,
    normalizedPhone,
  };
};
