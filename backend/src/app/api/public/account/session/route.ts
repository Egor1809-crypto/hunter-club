import { apiSuccess } from "@/lib/api";
import { buildGoogleVisitorProfile } from "@/lib/visitor-accounts";
import { createVisitorSessionToken, getCurrentVisitorSession, setVisitorSessionCookie } from "@/lib/visitor-auth";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const session = await getCurrentVisitorSession();

  if (!session) {
    return apiSuccess({
      authenticated: false,
      provider: null,
      account: null,
    });
  }

  let account = session.account;

  if (session.provider === "google" && session.subjectId) {
    const persistedAccount = await buildGoogleVisitorProfile(session.subjectId);

    if (!persistedAccount) {
      return apiSuccess({
        authenticated: false,
        provider: null,
        account: null,
      });
    }

    account = persistedAccount;
  }

  const refreshedToken = createVisitorSessionToken({
    provider: session.provider,
    subjectId: session.subjectId,
    account,
  });

  await setVisitorSessionCookie(refreshedToken);

  return apiSuccess({
    authenticated: true,
    provider: session.provider,
    account,
    needsPhoneLink: false,
  });
};
