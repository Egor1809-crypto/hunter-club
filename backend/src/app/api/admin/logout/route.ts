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

  const csrfResponse = requireAdminCsrf(request);

  if (csrfResponse) {
    return csrfResponse;
  }

  await revokeAdminSessions(admin.id);
  clearAdminSessionCookie();
  return apiSuccess({ loggedOut: true });
};
