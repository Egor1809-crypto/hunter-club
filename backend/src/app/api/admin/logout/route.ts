import { apiSuccess } from "@/lib/api";
import {
  clearAdminSessionCookie,
  requireAdminCsrf,
  requireAdminSession,
  revokeAdminSessions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  const { admin, response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const csrfResponse = await requireAdminCsrf(request);

  if (csrfResponse) {
    return csrfResponse;
  }

  await revokeAdminSessions(admin.id);
  await clearAdminSessionCookie();
  return apiSuccess({ loggedOut: true });
};
