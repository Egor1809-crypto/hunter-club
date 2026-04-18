import { apiSuccess } from "@/lib/api";
import { clearVisitorSessionCookie } from "@/lib/visitor-auth";

export const POST = async () => {
  clearVisitorSessionCookie();

  return apiSuccess({
    loggedOut: true,
  });
};
