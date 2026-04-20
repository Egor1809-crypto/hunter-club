"use client";

const CSRF_COOKIE_NAME = "hunter_admin_csrf";

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return cookie ? decodeURIComponent(cookie) : "";
};

export const adminFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  const csrfToken = getCookie(CSRF_COOKIE_NAME);

  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  return fetch(input, {
    ...init,
    headers,
  });
};
