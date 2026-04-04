import { prisma } from "@/lib/db";

type SmsProvider = "none" | "sms_ru" | "twilio";

const readSettingValue = async (key: string) => {
  const setting = await prisma.settings.findUnique({
    where: { key },
  });

  return setting?.value;
};

export const getSmsProvider = async (): Promise<SmsProvider> => {
  const provider = await readSettingValue("sms_provider");

  if (provider === "sms_ru" || provider === "twilio") {
    return provider;
  }

  if (typeof provider === "string" && (provider === "sms_ru" || provider === "twilio")) {
    return provider;
  }

  return "none";
};

export const getSmsApiKey = async () => {
  const apiKey = await readSettingValue("sms_api_key");
  return typeof apiKey === "string" ? apiKey : "";
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
    console.info(`[SMS:${provider}] ${phone}: ${message}`);
    return { status: "sent" as const, errorDetails: null };
  }

  const apiKey = await getSmsApiKey();

  if (!apiKey) {
    return {
      status: "failed" as const,
      errorDetails: `SMS provider ${provider} is configured without api key`,
    };
  }

  console.info(`[SMS:${provider}] ${phone}: ${message}`);

  return { status: "sent" as const, errorDetails: null };
};
