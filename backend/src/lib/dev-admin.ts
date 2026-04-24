export const DEV_ADMIN_ID = "dev-admin";

const isDevelopment = () => process.env.NODE_ENV !== "production";

export const isDatabaseUnavailableError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Can't reach database server") ||
    error.message.includes("PrismaClientInitializationError") ||
    error.message.includes("P1001")
  );
};

export const getDevAdminUser = () => {
  if (!isDevelopment()) {
    return null;
  }

  return {
    id: DEV_ADMIN_ID,
    username: process.env.DEV_ADMIN_USERNAME || "admin",
    password: process.env.DEV_ADMIN_PASSWORD || "hunter123",
    role: "owner",
    display_name: process.env.DEV_ADMIN_DISPLAY_NAME || "Dev Admin",
  };
};

export const matchesDevAdminCredentials = ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const devAdmin = getDevAdminUser();

  if (!devAdmin) {
    return false;
  }

  return username === devAdmin.username && password === devAdmin.password;
};

export const isDevAdminSessionPayload = (payload: { id: string; username: string }) => {
  const devAdmin = getDevAdminUser();

  if (!devAdmin) {
    return false;
  }

  return payload.id === devAdmin.id && payload.username === devAdmin.username;
};
