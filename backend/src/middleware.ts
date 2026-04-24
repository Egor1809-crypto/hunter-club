import { NextResponse, type NextFetchEvent } from "next/server";
import type { NextRequest } from "next/server";
import { getAppUrl, getFrontendUrl, isProduction } from "@/lib/env";

const applyPublicCors = (request: NextRequest, response: NextResponse) => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return response;
  }

  const allowedOrigins = new Set([getFrontendUrl(), getAppUrl()]);

  if (!isProduction) {
    allowedOrigins.add("http://localhost:8080");
    allowedOrigins.add("http://127.0.0.1:8080");
  }

  if (!allowedOrigins.has(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Vary", "Origin");
  return response;
};

export const middleware = (request: NextRequest, _event: NextFetchEvent) => {
  if (request.nextUrl.pathname.startsWith("/api/public/") && request.method === "OPTIONS") {
    return applyPublicCors(request, new NextResponse(null, { status: 204 }));
  }

  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  const scriptSrc = isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectSrc = isProduction ? "connect-src 'self' https:" : "connect-src 'self' https: http: ws: wss:";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    scriptSrc,
    connectSrc,
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return request.nextUrl.pathname.startsWith("/api/public/") ? applyPublicCors(request, response) : response;
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
