import { apiSuccess } from "@/lib/api";
import { clearAdminSessionCookie } from "@/lib/auth";

export const POST = async () => {
  clearAdminSessionCookie();
  return apiSuccess({ loggedOut: true });
};
