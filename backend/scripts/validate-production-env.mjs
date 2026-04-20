import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), process.argv[2] ?? ".env.production");

const forbiddenValues = new Set([
  "",
  "change-me",
  "change-me-in-production",
  "replace-me",
  "your-google-client-id.apps.googleusercontent.com",
  "your-google-client-secret",
  "replace-with-a-long-random-secret-at-least-32-characters",
  "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_WITH_32_PLUS_CHARACTERS",
]);

const requiredKeys = [
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SMS_PROVIDER",
];

const parseEnv = (content) => {
  const values = new Map();

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    values.set(key, value);
  }

  return values;
};

if (!existsSync(envPath)) {
  console.error(`Production env file not found: ${envPath}`);
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const errors = [];

for (const key of requiredKeys) {
  const value = env.get(key);

  if (value === undefined || forbiddenValues.has(value)) {
    errors.push(`${key} is missing or still uses a placeholder`);
  }
}

const sessionSecret = env.get("NEXTAUTH_SECRET") ?? "";
if (sessionSecret.length < 32) {
  errors.push("NEXTAUTH_SECRET must be at least 32 characters long");
}

const postgresPassword = env.get("POSTGRES_PASSWORD") ?? "";
if (postgresPassword.length < 16 || postgresPassword === "hunter_secret_2024") {
  errors.push("POSTGRES_PASSWORD must be changed and at least 16 characters long");
}

const nextAuthUrl = env.get("NEXTAUTH_URL") ?? "";
if (nextAuthUrl.startsWith("http://localhost")) {
  errors.push("NEXTAUTH_URL must point to the production domain, not localhost");
}

const smsProvider = env.get("SMS_PROVIDER") ?? "none";
if (!["none", "sms_ru", "twilio"].includes(smsProvider)) {
  errors.push("SMS_PROVIDER must be one of: none, sms_ru, twilio");
}

if (smsProvider !== "none" && !env.get("SMS_API_KEY")) {
  errors.push("SMS_API_KEY is required when SMS_PROVIDER is not none");
}

if (errors.length > 0) {
  console.error("Production env validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Production env looks ready: ${envPath}`);
