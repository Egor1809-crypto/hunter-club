const required = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const isProduction = process.env.NODE_ENV === "production";

export const getSessionSecret = () => {
  const secret = required(process.env.NEXTAUTH_SECRET, "NEXTAUTH_SECRET");

  if (secret === "change-me-in-production") {
    throw new Error("NEXTAUTH_SECRET must be changed before running the backend");
  }

  if (secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters long");
  }

  return secret;
};

export const getAppUrl = () => required(process.env.NEXTAUTH_URL, "NEXTAUTH_URL");
