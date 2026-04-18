import { apiSuccess } from "@/lib/api";
import { buildGoogleVisitorProfile, getGoogleVisitorNeedsPhoneLink } from "@/lib/visitor-accounts";
import { createVisitorSessionToken, getCurrentVisitorSession, setVisitorSessionCookie } from "@/lib/visitor-auth";

export const GET = async () => {
  const session = getCurrentVisitorSession();

  if (!session) {
    return apiSuccess({
      authenticated: false,
      provider: null,
      account: null,
    });
  }

  let account = session.account;
  let needsPhoneLink = false;

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
    needsPhoneLink = await getGoogleVisitorNeedsPhoneLink(session.subjectId);
  }

  const refreshedToken = createVisitorSessionToken({
    provider: session.provider,
    subjectId: session.subjectId,
    account,
  });

  setVisitorSessionCookie(refreshedToken);

  return apiSuccess({
    authenticated: true,
    provider: session.provider,
    account,
    needsPhoneLink,
  });
};
