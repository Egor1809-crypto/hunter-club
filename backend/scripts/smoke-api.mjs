#!/usr/bin/env node

const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const cookieJar = new Map();

const rememberCookies = (response) => {
  const setCookie = response.headers.getSetCookie?.() || [];

  for (const cookie of setCookie) {
    const [pair] = cookie.split(";");
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex > 0) {
      cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
    }
  }
};

const getCookieHeader = () =>
  Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const cookieHeader = getCookieHeader();

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    redirect: options.redirect || "manual",
  });
  const durationMs = Math.round(performance.now() - startedAt);

  rememberCookies(response);

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  return { response, body, durationMs };
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const logCheck = ({ name, status, durationMs }) => {
  console.log(`${name}: ${status} ${durationMs}ms`);
};

const runPublicSmoke = async () => {
  const services = await request("/api/public/services");
  logCheck({ name: "public_services", status: services.response.status, durationMs: services.durationMs });
  assert(services.response.status === 200, "Expected /api/public/services to return 200");
  assert(services.body?.success === true, "Expected /api/public/services success=true");
  assert(Array.isArray(services.body.data), "Expected /api/public/services data to be an array");

  const session = await request("/api/public/account/session");
  logCheck({ name: "public_session", status: session.response.status, durationMs: session.durationMs });
  assert(session.response.status === 200, "Expected /api/public/account/session to return 200");
  assert(session.body?.success === true, "Expected /api/public/account/session success=true");
  assert(typeof session.body.data?.authenticated === "boolean", "Expected session.authenticated boolean");

  const googleStart = await request("/api/public/account/google/start");
  logCheck({ name: "google_start", status: googleStart.response.status, durationMs: googleStart.durationMs });
  assert([302, 307].includes(googleStart.response.status), "Expected Google start to redirect");

  const location = googleStart.response.headers.get("location") || "";
  assert(location.startsWith("https://accounts.google.com/"), "Expected Google redirect location");
  assert(location.includes("redirect_uri="), "Expected Google redirect_uri parameter");
};

const runAdminSmoke = async () => {
  const username = process.env.SMOKE_ADMIN_USERNAME;
  const password = process.env.SMOKE_ADMIN_PASSWORD;
  const mfaCode = process.env.SMOKE_ADMIN_MFA_CODE;

  if (!username || !password || !mfaCode) {
    console.log("admin_login: skipped (set SMOKE_ADMIN_USERNAME, SMOKE_ADMIN_PASSWORD, SMOKE_ADMIN_MFA_CODE)");
    return;
  }

  const login = await request("/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password, mfaCode }),
  });
  logCheck({ name: "admin_login", status: login.response.status, durationMs: login.durationMs });
  assert(login.response.status === 200, "Expected admin login to return 200");
  assert(login.body?.success === true, "Expected admin login success=true");

  const me = await request("/api/admin/me");
  logCheck({ name: "admin_me", status: me.response.status, durationMs: me.durationMs });
  assert(me.response.status === 200, "Expected /api/admin/me to return 200 after login");
  assert(me.body?.success === true, "Expected /api/admin/me success=true");
};

try {
  await runPublicSmoke();
  await runAdminSmoke();
  console.log(`smoke_api: ok (${baseUrl})`);
} catch (error) {
  console.error(`smoke_api: failed (${baseUrl})`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
