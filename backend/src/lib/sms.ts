import { prisma } from "@/lib/db";

type SmsProvider = "none" | "sms_ru" | "twilio";

const getEnvValue = (key: string) => {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
};

const readSettingValue = async (key: string) => {
  const setting = await prisma.settings.findUnique({
    where: { key },
  });

  return setting?.value;
};

const readStringSetting = async (key: string) => {
  const value = await readSettingValue(key);
  return typeof value === "string" ? value.trim() : "";
};

export const getSmsProvider = async (): Promise<SmsProvider> => {
  const envProvider = getEnvValue("SMS_PROVIDER");
  const provider = await readStringSetting("sms_provider");

  if (envProvider === "sms_ru" || envProvider === "twilio" || envProvider === "none") {
    return envProvider;
  }

  if (provider === "sms_ru" || provider === "twilio" || provider === "none") {
    return provider;
  }

  return "none";
};

export const getSmsApiKey = async () => {
  const apiKey = await readStringSetting("sms_api_key");
  return apiKey || getEnvValue("SMS_API_KEY");
};

const sendViaSmsRu = async ({
  phone,
  message,
  apiKey,
}: {
  phone: string;
  message: string;
  apiKey: string;
}) => {
  const sender = getEnvValue("SMS_RU_FROM");
  const body = new URLSearchParams({
    api_id: apiKey,
    to: phone,
    msg: message,
    json: "1",
  });

  if (sender) {
    body.set("from", sender);
  }

  const response = await fetch("https://sms.ru/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: "failed" as const,
      errorDetails: `sms.ru request failed with status ${response.status}`,
    };
  }

  const payload = (await response.json()) as {
    status?: string;
    status_text?: string;
    status_code?: number;
    sms?: Record<string, { status?: string; status_text?: string; status_code?: number }>;
  };

  const result = payload.sms?.[phone];

  if (payload.status !== "OK" || result?.status !== "OK") {
    return {
      status: "failed" as const,
      errorDetails:
        result?.status_text ||
        payload.status_text ||
        `sms.ru error ${result?.status_code ?? payload.status_code ?? "unknown"}`,
    };
  }

  return { status: "sent" as const, errorDetails: null };
};

const sendViaTwilio = async ({
  phone,
  message,
}: {
  phone: string;
  message: string;
}) => {
  const accountSid = getEnvValue("TWILIO_ACCOUNT_SID");
  const authToken = getEnvValue("TWILIO_AUTH_TOKEN");
  const fromNumber = getEnvValue("TWILIO_FROM_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    return {
      status: "failed" as const,
      errorDetails: "Twilio is not fully configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER.",
    };
  }

  const body = new URLSearchParams({
    To: phone,
    From: fromNumber,
    Body: message,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string; code?: number }
      | null;

    return {
      status: "failed" as const,
      errorDetails: payload?.message || `Twilio request failed with status ${response.status}`,
    };
  }

  return { status: "sent" as const, errorDetails: null };
};

export const sendSmsMessage = async ({
  provider,
  phone,
  message,
}: {
  provider: SmsProvider;
  phone: string;
  message: string;
}) => {
  if (provider === "none") {
    return {
      status: "failed" as const,
      errorDetails: "SMS provider is not configured yet",
    };
  }

  const apiKey = await getSmsApiKey();

  if (provider === "sms_ru" && !apiKey) {
    return {
      status: "failed" as const,
      errorDetails: `SMS provider ${provider} is configured without api key`,
    };
  }

  if (provider === "sms_ru") {
    return sendViaSmsRu({ phone, message, apiKey });
  }

  if (provider === "twilio") {
    return sendViaTwilio({ phone, message });
  }

  return {
    status: "failed" as const,
    errorDetails: `Unsupported SMS provider: ${provider}`,
  };
};
