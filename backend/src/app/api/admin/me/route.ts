import { apiError, apiSuccess } from "@/lib/api";
import { getCurrentAdminSession } from "@/lib/auth";

export const GET = async () => {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    return apiError("Unauthorized", 401);
  }

  return apiSuccess(admin);
};
