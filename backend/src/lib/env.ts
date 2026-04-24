const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const isProduction = process.env.NODE_ENV === "production";

const forbiddenSessionSecrets = new Set([
  "change-me-in-production",
  "replace-with-a-long-random-secret-at-least-32-characters",
  "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_WITH_32_PLUS_CHARACTERS",
]);

export const getSessionSecret = () => {
  const secret = required(process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET").trim();

  if (forbiddenSessionSecrets.has(secret)) {
    throw new Error("NEXTAUTH_SECRET must be changed before running the backend");
  }

  if (secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters long");
  }

  return secret;
};

export const getAppUrl = () => required(process.env.NEXTAUTH_URL, "NEXTAUTH_URL");

export const getFrontendUrl = () => process.env.FRONTEND_URL?.trim() || getAppUrl();
