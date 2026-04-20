import { randomUUID } from "node:crypto";

type LogContext = Record<string, string | number | boolean | null | undefined>;

const redact = (value: string) =>
  value.replace(/(token|secret|password|api[_-]?key)=([^&\s]+)/gi, "$1=[redacted]");

export const getRequestId = (request?: Request) =>
  request?.headers.get("x-request-id") || request?.headers.get("x-correlation-id") || randomUUID();

export const logError = ({
  requestId,
  message,
  error,
  context,
}: {
  requestId: string;
  message: string;
  error: unknown;
  context?: LogContext;
}) => {
  const details =
    error instanceof Error
      ? {
          name: error.name,
          message: redact(error.message),
          stack: error.stack ? redact(error.stack) : undefined,
        }
      : { message: redact(String(error)) };

  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      message,
      context: context ?? null,
      error: details,
      timestamp: new Date().toISOString(),
    }),
  );
};
