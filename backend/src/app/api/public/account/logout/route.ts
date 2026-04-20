import { apiSuccess } from "@/lib/api";
import { clearVisitorSessionCookie, getCurrentVisitorSession, revokeVisitorSession } from "@/lib/visitor-auth";

export const dynamic = "force-dynamic";

export const POST = async () => {
  const session = await getCurrentVisitorSession();

  if (session) {
    await revokeVisitorSession({
      provider: session.provider,
      subjectId: session.subjectId,
    });
  }

  clearVisitorSessionCookie();

  return apiSuccess({
    loggedOut: true,
  });
};
