import { NextResponse } from "next/server";
import { getRequestId, logError } from "@/lib/logger";

type Meta = {
  total?: number;
  page?: number;
  pageSize?: number;
  requestId?: string;
};

export const apiSuccess = <T>(data: T, meta?: Meta) =>
  NextResponse.json({
    success: true,
    data,
    error: null,
    meta: meta ?? null,
  });

export const apiError = (error: string, status = 400) =>
  NextResponse.json(
    {
      success: false,
      data: null,
      error,
      meta: null,
    },
    { status },
  );

export const apiException = ({
  request,
  error,
  message,
  status = 500,
  context,
}: {
  request?: Request;
  error: unknown;
  message: string;
  status?: number;
  context?: Record<string, string | number | boolean | null | undefined>;
}) => {
  const requestId = getRequestId(request);

  logError({
    requestId,
    message,
    error,
    context,
  });

  return NextResponse.json(
    {
      success: false,
      data: null,
      error: message,
      meta: { requestId },
    },
    { status },
  );
};

export const parsePagination = (searchParams: URLSearchParams) => {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
};

export const formatZodError = (error: { issues: Array<{ path: (string | number)[]; message: string }> }) =>
  error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
